import config from './Config.ts'
import { DanmakuReceiver } from './DanmakuReceiver.ts'
import { buildCallbackByRoomConfig } from './DanmakuCallbacks.ts'
import { printLog } from './utils/mod.ts'
import { launchAllPlugins } from './Plugins.ts'

const roomReceiverMap: Map<number, DanmakuReceiver> = new Map()

await launchAllPlugins()

for (const room of config.rooms) {
  if (typeof room === 'number') {
    if (room === 0) {
      continue
    }
    const danmakuReceiver = new DanmakuReceiver(room, config.verify)
    danmakuReceiver.on('connected', () => {
      printLog('主程序', `[${room}]连接成功`)
    })
    const { onGraud, onSuperChat, onTotalGift, onLiveStart, onLiveEnd, receiveDanmaku, receiveGift } = buildCallbackByRoomConfig(room)
    if (!config.defaultConfig.disable_gift_action) {
      danmakuReceiver.on('COMBO_SEND', onTotalGift)
      danmakuReceiver.on('SEND_GIFT', receiveGift)
    }
    if (!config.defaultConfig.disable_super_chat_action) {
      danmakuReceiver.on('GUARD_BUY', onGraud)
    }
    if (!config.defaultConfig.disable_super_chat_action) {
      danmakuReceiver.on('SUPER_CHAT_MESSAGE', onSuperChat)
    }
    globalThis.onunload = () => {
      printLog('主程序', '退出')
    }
    danmakuReceiver.on('closed', (reason: string) => {
      printLog('主程序', `[${room}]掉线了 ${reason}`)
      danmakuReceiver.connect().then()
    })
    if (!config.defaultConfig.disable_greeting) {
      danmakuReceiver.on('LIVE', onLiveStart)
      danmakuReceiver.on('PREPARING', onLiveEnd)
    }
    danmakuReceiver.on('DANMU_MSG', receiveDanmaku)
    await danmakuReceiver.connect()
    roomReceiverMap.set(room, danmakuReceiver)
  } else {
    if (room.room_id === 0) {
      continue
    }
    const danmakuReceiver = new DanmakuReceiver(room.room_id, room.verify || config.verify)
    danmakuReceiver.on('connected', () => {
      printLog('主程序', `[${room.room_id}]连接成功`)
    })
    const { onGraud, onSuperChat, onTotalGift, onLiveStart, onLiveEnd, receiveDanmaku, receiveGift } = buildCallbackByRoomConfig(room)
    if (!room.disable_gift_action) {
      danmakuReceiver.on('COMBO_SEND', onTotalGift)
      danmakuReceiver.on('SEND_GIFT', receiveGift)
    }
    if (!room.disable_super_chat_action) {
      danmakuReceiver.on('GUARD_BUY', onGraud)
    }
    if (!room.disable_super_chat_action) {
      danmakuReceiver.on('SUPER_CHAT_MESSAGE', onSuperChat)
    }
    globalThis.onunload = () => {
      printLog('主程序', '退出')
    }
    danmakuReceiver.on('closed', (reason: string) => {
      printLog('主程序', `[${room.room_id}]掉线了 ${reason}`)
      danmakuReceiver.connect().then()
    })
    if (!room.disable_greeting) {
      danmakuReceiver.on('LIVE', onLiveStart)
      danmakuReceiver.on('PREPARING', onLiveEnd)
    }
    danmakuReceiver.on('DANMU_MSG', receiveDanmaku)
    await danmakuReceiver.connect()
    roomReceiverMap.set(room.room_id, danmakuReceiver)
  }
}
