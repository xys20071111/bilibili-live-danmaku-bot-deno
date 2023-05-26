import { brotli, EventEmitter, WebSocketClient } from "./Deps.ts"
import { Credential } from "./Config.ts"
import { printLog } from "./utils/mod.ts"
import { server as apiServer } from './APIServer.ts'

enum DANMAKU_PROTOCOL {
  JSON = 0,
  HEARTBEAT,
  ZIP,
  BROTLI,
}

enum DANMAKU_TYPE {
  HEARTBEAT = 2,
  HEARTBEAT_REPLY = 3,
  DATA = 5,
  AUTH = 7,
  AUTH_REPLY = 8,
}

const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8")

export class DanmakuReceiver extends EventEmitter {
  private roomId: number
  private ws: WebSocket | null = null
  private credential: Credential
  constructor(roomId: number, credential: Credential) {
    super()
    this.roomId = roomId
    this.credential = credential
  }
  public async connect() {
    const roomConfig = await (await fetch(
      `https://api.live.bilibili.com/xlive/web-room/v1/index/getDanmuInfo?id=${this.roomId}&type=0`,
      {
        headers: {
          Cookie: `buvid3=${this.credential.buvid3}SESSDATA=${this.credential.sessdata}bili_jct=${this.credential.csrf}`,
          "User-Agent":
            "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36",
          Host: "api.live.bilibili.com",
          Origin: 'https://live.bilibili.com',
          Referer: `https://live.bilibili.com/${this.roomId}?broadcast_type=0`
        },
      },
    )).json()
    this.ws = new WebSocket(`wss://${roomConfig.data.host_list[0].host}:${roomConfig.data.host_list[0].wss_port}/sub`)
    this.ws.onopen = () => {
      const payload = JSON.stringify({
        roomid: this.roomId,
        protover: 3,
        platform: "web",
        uid: this.credential.uid,
        key: roomConfig.data.token,
        type: 2
      })
      this.ws!.send(this.generatePacket(1, 7, payload,))
      this.ws!.onmessage = this.danmakuProcesser.bind(this)
    }
    this.ws.onclose = () => {
      this.emit("closed")
    }
  }
  private generatePacket(
    protocol: number,
    type: number,
    payload: string,
  ): ArrayBuffer {
    const payloadEncoded = encoder.encode(payload)
    const packetLength = 16 + payloadEncoded.length
    const packet = new ArrayBuffer(packetLength)
    const packetArray = new Uint8Array(packet)
    const packetView = new DataView(packet)
    packetView.setInt32(0, packetLength) // 总长度
    packetView.setInt16(4, 16) // 头长度
    packetView.setUint16(6, protocol) // 协议类型
    packetView.setUint32(8, type) // 包类型
    packetView.setUint32(12, 1) // 一个常数
    packetArray.set(payloadEncoded, 16) //写入负载
    return packet
  }
  private async danmakuProcesser(ev: MessageEvent<Blob>) {
    // 弹幕事件处理
    const msgPacket = await ev.data.arrayBuffer()
    const msgArray = new Uint8Array(msgPacket)
    const msg = new DataView(msgPacket)
    const packetProtocol = msg.getInt16(6)
    const packetType = msg.getInt32(8)
    const packetPayload: Uint8Array = msgArray.slice(16)
    let jsonData
    switch (packetType) {
      case DANMAKU_TYPE.HEARTBEAT_REPLY:
        // 心跳包，不做处理
        break
      case DANMAKU_TYPE.AUTH_REPLY:
        printLog('弹幕接收器', "通过认证")
        // 认证通过，每30秒发一次心跳包
        setInterval(() => {
          const heartbeatPayload = "陈睿你妈死了"
          if (this.ws) {
            this.ws.send(this.generatePacket(1, 2, heartbeatPayload))
          }
        }, 30000)
        this.emit("connected")
        break
      case DANMAKU_TYPE.DATA:
        switch (packetProtocol) {
          case DANMAKU_PROTOCOL.JSON:
            // 这些数据大都没用，但还是留着吧
            jsonData = JSON.parse(decoder.decode(packetPayload))
            this.emit(jsonData.cmd, jsonData.data)
            break
          case DANMAKU_PROTOCOL.BROTLI: {
            const resultRaw = brotli.decompress(packetPayload)
            const result = new DataView(resultRaw.buffer)
            let offset = 0
            while (offset < resultRaw.length) {
              const length = result.getUint32(offset)
              const packetData = resultRaw.slice(offset + 16, offset + length)
              const data = JSON.parse(decoder.decode(packetData))
              const cmd = data.cmd.split(":")[0]
              this.emit(cmd, this.roomId, data.info || data.data)
              apiServer.clients.forEach((client: WebSocketClient) => {
                client.send(JSON.stringify({ cmd, room: this.roomId, data: data.info || data.data }))
              })
              offset += length
            }
          }
        }
        break
      default:
        printLog('弹幕接收器', `未知的弹幕数据包种类 ${packetType}`)
    }
  }
}
