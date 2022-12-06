import { getTimeString } from './GetTimeString.ts'
export function printLog(source: string, msg: unknown) {
    console.log(`[log][${source}][${getTimeString()}] ${msg}`)
}
export function printErr(source: string, msg: unknown) {
    console.error(`[err][${source}][${getTimeString()}] ${msg}`)
}