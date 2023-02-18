import { EventEmitter, WebSocketClient, WebSocketServer } from "./Deps.ts"
import { sendDanmaku } from './SendDanmaku.ts'
import config from "./Config.ts"

interface Message {
  cmd: string
  // deno-lint-ignore no-explicit-any
  data: any
}

const server: WebSocketServer = new WebSocketServer(config.api.port)
const authedClientSet: Set<WebSocketClient> = new Set()

class APIMsgHandler extends EventEmitter {
  emit(
    eventName: string | symbol,
    socket: WebSocketClient,
    ...args: unknown[]
  ): boolean {
    if (eventName === "AUTH") {
      if (args[0] === config.api.token) {
        authedClientSet.add(socket)
        socket.send(JSON.stringify({ cmd: "AUTH", data: "AUTHED" }))
        return true
      } else {
        socket.send(JSON.stringify({ cmd: "AUTH", data: "FAILED" }))
        return true
      }
    }
    if (authedClientSet.has(socket)) {
      return super.emit.apply(this, [eventName, socket, args])
    }
    return false
  }
}

const serverEventEmitter = new APIMsgHandler()

serverEventEmitter.on("SEND", (_socket: WebSocketClient, dataJson: string) => {
  const data: {
    msg: string
    roomId: number
  } = JSON.parse(dataJson)
  sendDanmaku(data.roomId, {
    msg: data.msg
  })
})

server.on("connection", (client: WebSocketClient) => {
  client.on("message", (data: string) => {
    const msg: Message = JSON.parse(data)
    serverEventEmitter.emit(msg.cmd, client, msg.data)
  })
})

export { server }
