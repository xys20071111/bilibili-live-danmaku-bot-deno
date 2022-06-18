import { getTimeString } from './getTimeString.ts'
export function printLog(msg: unknown) {
    console.log(`[${getTimeString()}] ${msg}`)
}