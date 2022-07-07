import crypto from 'crypto'

const VALID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateRandomString(length = 64): string {
    const array = new Uint8Array(length)
    crypto.randomFillSync(array)
    const mappedArray = array.map(x => VALID_CHARS.charCodeAt(x % VALID_CHARS.length))
    return String.fromCharCode.apply(null, [...mappedArray])
}

export function generateHash(data: string): string {
    const hash = crypto.createHash('sha256')
    hash.update(data)
    const hashedData = hash.digest('base64')

    return base64UrlEncode(hashedData)
}

export function base64UrlEncode(hashedData: string): string {
    return hashedData
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}