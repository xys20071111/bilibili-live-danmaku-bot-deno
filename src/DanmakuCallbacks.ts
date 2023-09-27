// deno-lint-ignore-file
/* eslint-disable @typescript-eslint/no-explicit-any */
import config from './Config.ts'
import { RoomConfig } from './Config.ts'
import { sendDanmaku } from './SendDanmaku.ts'
import { Encoding } from './Text.ts'
import { getTimeString, FormatString } from './utils/mod.ts'
let skipCount = 0
let logFile = Deno.openSync(`./log/${getTimeString()}.log`, {
  create: true,
  write: true
})
const thanksColdDownSet = new Set<string>()
const { defaultConfig } = config

export function buildCallbackByRoomConfig(room: RoomConfig) {
  const verify = room.verify || config.verify
  const receiveGift = (roomId: number, data: any) => {
    if (thanksColdDownSet.has(data.uname)) {
      return
    }
    logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.uname} 投喂了${data.super_gift_num}个 ${data.giftName} 价值${data.price / 1000 * data.super_gift_num}元\n`))
    if (room.free_gift_action || data.super_gift_num > 0) {
      sendDanmaku(roomId, {
        msg: FormatString((room.danmakus?.gift || defaultConfig.danmakus.gift), { name: data.uname, gift: data.giftName })
      }, verify)
      thanksColdDownSet.add(data.uname)
      setTimeout(() => { thanksColdDownSet.delete(data.uname) }, room.cold_down_time)
    }
  }
  const onTotalGift = (roomId: number, data: any) => {
    logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.uname}投喂了${data.total_num}个${data.gift_name}\n`))
    sendDanmaku(roomId, {
      msg: FormatString((room.danmakus?.gift_total || defaultConfig.danmakus.gift_total), { name: data.uname, gift: data.gift_name, count: data.total_num })
    }, verify)
  }
  const receiveDanmaku = (roomId: number, data: any) => {
    logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${roomId} ${data[2][1]}:${data[2][0]}  ${data[1]}\n`))
  }
  const onLiveStart = (roomId: number) => {
    if (skipCount != 1) {
      skipCount++
      return
    }
    skipCount = 0
    sendDanmaku(roomId, { msg: (room.danmakus?.live_start || defaultConfig.danmakus.live_start) }, verify)
    logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${roomId}直播开始\n`))
  }
  const onLiveEnd = (roomId: number) => {
    logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${roomId}直播结束\n`))
    sendDanmaku(roomId, { msg: (room.danmakus?.live_end || defaultConfig.danmakus.live_end) }, verify)
  }
  const onGraud = (roomId: number, data: any) => {
    logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.username}:${data.uid} 购买了 ${data.gift_name}\n`))
    sendDanmaku(roomId, {
      msg: FormatString((room.danmakus?.guard || defaultConfig.danmakus.guard), { type: data.gift_name, name: data.username })
    }, verify)
  }
  const onSuperChat = (roomId: number, data: any) => {
    logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.user_info.uname}发送了SC 价格${data.price}\n`))
    sendDanmaku(roomId, {
      msg: FormatString((room.danmakus?.sc || defaultConfig.danmakus.sc), { name: data.user_info.uname })
    }, verify)
  }
  return { receiveGift, onTotalGift, receiveDanmaku, onLiveStart, onLiveEnd, onGraud, onSuperChat }
}