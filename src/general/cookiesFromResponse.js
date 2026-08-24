import setCookieParser from "set-cookie-parser";

export function cookiesFromResponse(response, decodeValues = false) {
    const obj = {};
    const cookies = setCookieParser.parse(response, {decodeValues});
    for (const cookie of cookies) {
        obj[cookie.name] = cookie.value;
    }
    return obj;
}
