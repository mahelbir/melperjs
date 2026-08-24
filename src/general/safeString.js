import xss from "xss";

export function safeString(string) {
    return xss(string || "", {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "form"],
        css: false
    });
}
