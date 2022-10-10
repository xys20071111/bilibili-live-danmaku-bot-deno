interface DanmakuTemplate {
  live_start: string
  live_end: string
  gift: string
  gift_total: string
  guard: string
  sc: string
  advertisement: string
}

interface Credential {
  sessdata: string
  csrf: string
  buvid3: string
  uid: number
}

interface api_config {
  token: string
  port: number
}

interface ConfigStruct {
  room_id: number
  verify: Credential
  danmakus: DanmakuTemplate
  cold_down_time: number
  advertiseing_cold_down: number
  api: api_config
  free_gift_action: boolean
}

const decoder = new TextDecoder('utf-8')
const config: ConfigStruct = JSON.parse(decoder.decode(Deno.readFileSync(`config/${Deno.args[0]}`)));

export default config;
