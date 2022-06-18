const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8')
const Encoding = {
    UTF8: {
        getBytes (str: string) {
            return encoder.encode(str)
        },
        getText (buffer: Uint8Array) {
            return decoder.decode(buffer)
        }
    }
}

export { Encoding }