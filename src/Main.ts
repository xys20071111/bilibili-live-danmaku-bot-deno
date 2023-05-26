import config from './Config.ts'
import { DanmakuReceiver } from './DanmakuReceiver.ts'
import { onGraud, onLiveEnd, onLiveStart, onSuperChat, onTotalGift, receiveDanmaku, receiveGift } from './DanmakuCallbacks.ts'
import { printLog } from './utils/mod.ts'
import { launchAllPlugins } from './Plugins.ts'

const roomReceiverMap: Map<number, DanmakuReceiver> = new Map()
for(const room of config.room_id) {
  const danmakuReceiver = new DanmakuReceiver(room)
  danmakuReceiver.on('connected', () => {
    printLog('主程序', `[${room}]连接成功`)
  })

  if (!config.disable_gift_action) {
    danmakuReceiver.on('COMBO_SEND', onTotalGift)
    danmakuReceiver.on('SEND_GIFT', receiveGift)
  }
  if (!config.disable_super_chat_action) {
    danmakuReceiver.on('GUARD_BUY', onGraud)
  }
  if (!config.disable_super_chat_action) {
    danmakuReceiver.on('SUPER_CHAT_MESSAGE', onSuperChat)
  }
  globalThis.onunload = () => {
    printLog('主程序', '退出')
  }
  danmakuReceiver.on('closed', () => {
    printLog('主程序', '掉线了')
    danmakuReceiver.connect()
  })
  if(!config.disable_greeting) {
    danmakuReceiver.on('LIVE', onLiveStart)
    danmakuReceiver.on('PREPARING', onLiveEnd)
  }
  danmakuReceiver.on('DANMU_MSG', receiveDanmaku)
  danmakuReceiver.connect()
  roomReceiverMap.set(room, danmakuReceiver)
}

launchAllPlugins()
