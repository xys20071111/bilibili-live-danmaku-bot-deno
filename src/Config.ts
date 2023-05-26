interface DanmakuTemplate {
  live_start: string
  live_end: string
  gift: string
  gift_total: string
  guard: string
  sc: string
  advertisement: string
}

export interface Credential {
  sessdata: string
  csrf: string
  buvid3: string
  uid: number
}

interface APIConfig {
  token: string
  port: number
}

export interface RoomConfig {
  room_id: number
  verify?: Credential
  danmakus: DanmakuTemplate
  cold_down_time: number
  advertiseing_cold_down: number
  free_gift_action?: boolean
  disable_gift_action?: boolean
  disable_super_chat_action?: boolean
  disable_graud_action?: boolean
  disable_greeting?: boolean
}

export interface ConfigStruct {
  verify: Credential
  rooms: Array<RoomConfig>
  api: APIConfig
}

const decoder = new TextDecoder('utf-8')
const config: ConfigStruct = JSON.parse(decoder.decode(Deno.readFileSync(Deno.args[0])))

export default config
