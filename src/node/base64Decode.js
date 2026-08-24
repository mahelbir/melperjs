export function base64Decode(data, encoding = 'utf8') {
    return Buffer.from(data, 'base64').toString(encoding);
}
