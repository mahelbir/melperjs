export function cookiesToHeader(cookies) {
    if (!cookies) return "";
    return Object.entries(cookies)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
}
