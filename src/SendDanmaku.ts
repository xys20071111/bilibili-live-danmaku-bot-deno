import config from "./Config.ts"

const cookie =
  `buvid3=${config.verify.buvid3}; SESSDATA=${config.verify.sessdata}; bili_jct=${config.verify.csrf}`

export interface DanmakuStruct {
  color?: number
  bubble?: number
  msg: string
  mode?: number
  fontsize?: number
  rnd?: number
  roomid?: number
  csrf?: string
  csrf_token?: string
}

export function sendDanmaku(danmaku: DanmakuStruct) {
  if (danmaku.msg.length > 19) {
    sendDanmaku({
      msg: danmaku.msg.slice(0, 15),
    })
    setTimeout(() => {
      sendDanmaku({
        msg: danmaku.msg.slice(15, danmaku.msg.length),
      })
    }, 2000)
    return
  }
  danmaku.rnd = new Date().getTime()
  if (!danmaku.color) {
    danmaku.color = 5816798
  }
  if (!danmaku.bubble) {
    danmaku.bubble = 0
  }
  if (!danmaku.mode) {
    danmaku.mode = 1
  }
  if (!danmaku.fontsize) {
    danmaku.fontsize = 24
  }
  danmaku.roomid = config.room_id as number
  danmaku.csrf = danmaku.csrf_token = config.verify.csrf
  const data = new FormData()
  for (const k in danmaku) {
    data.append(k, danmaku[k as keyof DanmakuStruct]!.toString())
  }
  fetch("https://api.live.bilibili.com/msg/send", {
    method: 'POST',
    body: data,
    headers: {
      cookie: cookie,
      "user-agent":
        "Mozilla/5.0 (X11 Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.64 Safari/537.36",
      host: "api.live.bilibili.com",
      "Referer": "https://live.bilibili.com",
    }
  })
}
