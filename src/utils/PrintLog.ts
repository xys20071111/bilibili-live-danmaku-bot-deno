import { getTimeString } from './GetTimeString.ts'
export function printLog(msg: unknown) {
    console.log(`[${getTimeString()}] ${msg}`)
}