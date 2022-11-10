import config from './Config.ts'
import { DanmakuReceiver } from './DanmakuReceiver.ts'
import { onGraud, onLiveEnd, onLiveStart, onSuperChat, onTotalGift, receiveDanmaku, receiveGift } from './DanmakuCallbacks.ts'
import { printLog } from './utils/mod.ts'

async function launchAllPlugins() {
  const pluginsList = await Deno.readDir('./plugins')
  for await (const plugin of pluginsList) {
    if (plugin.name === '.gitkeep') {
      continue
    }
    Deno.run({
      cmd: [`./plugins/${plugin.name}/${plugin.name}`, `./plugins/${plugin.name}/config.json`]
    })
  }
}

const danmakuReceiver = new DanmakuReceiver(config.room_id)
danmakuReceiver.on('connected', () => {
  printLog('主程序', '连接成功')
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

danmakuReceiver.on('closed', () => danmakuReceiver.connect())
danmakuReceiver.on('LIVE', onLiveStart)
danmakuReceiver.on('PREPARING', onLiveEnd)
danmakuReceiver.on('DANMU_MSG', receiveDanmaku)

launchAllPlugins()
danmakuReceiver.connect()
