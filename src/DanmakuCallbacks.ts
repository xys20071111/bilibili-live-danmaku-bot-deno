// deno-lint-ignore-file
/* eslint-disable @typescript-eslint/no-explicit-any */
import config from './Config.ts'
import { sendDanmaku } from './SendDanmaku.ts'
import { Encoding } from './Text.ts'
import { getTimeString, FormatString } from './utils/mod.ts'
let skipCount = 0
let logFile = Deno.openSync(`./log/${getTimeString()}-${config.room_id}.log`, {
  create: true,
  write: true
})
const thanksColdDownSet = new Set<string>()


export function receiveGift(roomId: number, data: any) {
  if(thanksColdDownSet.has(data.uname)){
    return
  }
  logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.uname} 投喂了${data.super_gift_num}个 ${data.giftName} 价值${data.price / 1000 * data.super_gift_num}元\n`))
  if (config.free_gift_action || data.super_gift_num > 0) {
    sendDanmaku(roomId, {
      msg: FormatString(config.danmakus.gift, { name: data.uname, gift: data.giftName })
    })
    thanksColdDownSet.add(data.uname)
    setTimeout(() => { thanksColdDownSet.delete(data.uname) }, config.cold_down_time)
  }
}

export function onTotalGift(roomId: number, data: any) {
  logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.uname}投喂了${data.total_num}个${data.gift_name}\n`))
  sendDanmaku(roomId, {
    msg: FormatString(config.danmakus.gift_total, { name: data.uname, gift: data.gift_name, count: data.total_num })
  })
}

export function receiveDanmaku(roomId:number, data: any) {
  console.log(JSON.stringify(data))
  logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${roomId} ${data[2][1]}:${data[2][0]}  ${data[1]}\n`))
}

export function onLiveStart(roomId: number) {
  if(skipCount != 1){
    skipCount ++
    return
  }
  skipCount = 0
  logFile.close()
  sendDanmaku(roomId, { msg: config.danmakus.live_start })
  logFile = Deno.openSync(`./log/${getTimeString()}-${config.room_id}.log`, {
    create: true,
    write: true
  })
  logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} 直播开始\n`))
}

export function onLiveEnd(roomId: number) {
  logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} 直播结束\n`))
  sendDanmaku(roomId, { msg: config.danmakus.live_end })
}

export function onGraud(roomId: number, data: any) {
  logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.username}:${data.uid} 购买了 ${data.gift_name}\n`))
  sendDanmaku(roomId, {
    msg: FormatString(config.danmakus.guard, { type: data.gift_name, name: data.username })
  })
}

export function onSuperChat(roomId: number, data: any) {
  logFile.writeSync(Encoding.UTF8.getBytes(`${getTimeString()} ${data.user_info.uname}发送了SC 价格${data.price}\n`))
  sendDanmaku(roomId, {
    msg: FormatString(config.danmakus.sc, { name: data.user_info.uname })
  })
}
