export function cookiesFromHeader(header) {
    const cookies = {};
    if (!header) return cookies;
    header.split(';').forEach(cookie => {
        const trimmed = cookie.trim();
        if (!trimmed.includes('=')) return;
        const [key, ...valueParts] = trimmed.split('=');
        const trimmedKey = key.trim();
        if (trimmedKey) {
            cookies[trimmedKey] = valueParts.join('=').trim();
        }
    });
    return cookies;
}
