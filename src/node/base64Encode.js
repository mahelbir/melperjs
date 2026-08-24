export function base64Encode(data) {
    return Buffer.from(data).toString('base64');
}
