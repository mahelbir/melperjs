import {normalizeProxy} from "./normalizeProxy.js";
import {randomHex} from "./randomHex.js";
import {randomInteger} from "./randomInteger.js";
import {seedHex} from "./seedHex.js";
import {splitTrim} from "./splitTrim.js";

export function proxyValue(rawProxy, replacements = {}) {
    const list = splitTrim(rawProxy || "");
    if (list.length === 0) return null;
    const picked = list[randomInteger(0, list.length)];

    let result = normalizeProxy(picked);
    if (!result) return null;

    if (result.includes("{")) {
        const {SESSION, ...rest} = replacements;
        let sessionValue;
        if (!SESSION && SESSION !== 0) {
            sessionValue = randomHex(8);
        } else if (typeof SESSION === "function") {
            sessionValue = SESSION();
        } else {
            sessionValue = seedHex(String(SESSION), 8);
        }
        result = result.replace("{SESSION}", sessionValue);
        for (const [key, value] of Object.entries(rest)) {
            const v = typeof value === "function" ? value() : String(value);
            result = result.replace(`{${key}}`, v);
        }
    }

    return result;
}
