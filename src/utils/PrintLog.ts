import { getTimeString } from './GetTimeString.ts'
export function printLog(type: string, msg: unknown) {
    console.log(`[${type}][${getTimeString()}] ${msg}`)
}