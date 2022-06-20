import config from './Config.ts';
import { DanmakuReceiver } from './DanmakuReceiver.ts';
import { onGraud, onLiveEnd, onLiveStart, onSuperChat, onTotalGift, receiveDanmaku, receiveGift } from './DanmakuCallbacks.ts';
import { printLog } from './utils/mod.ts';

const danmakuReceiver = new DanmakuReceiver(config.room_id);
danmakuReceiver.on('connected', () => {
  printLog('连接成功');
});

danmakuReceiver.on('closed', () => danmakuReceiver.connect());
danmakuReceiver.on('SEND_GIFT', receiveGift);
danmakuReceiver.on('LIVE', onLiveStart);
danmakuReceiver.on('PREPARING', onLiveEnd);
danmakuReceiver.on('DANMU_MSG', receiveDanmaku);
danmakuReceiver.on('COMBO_SEND', onTotalGift);
danmakuReceiver.on('GUARD_BUY', onGraud);
danmakuReceiver.on('SUPER_CHAT_MESSAGE', onSuperChat);

danmakuReceiver.connect();
