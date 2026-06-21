import xss from "xss";
import setCookieParser from "set-cookie-parser";
import { camelCase, upperFirst } from "es-toolkit/string";
import { shuffle } from "es-toolkit/array";
import isEmpty from "es-toolkit/compat/isEmpty";


export const CONSTANTS = {
    LOWER_CASE: "abcdefghijklmnopqrstuvwxyz",
    UPPER_CASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    HEXADECIMAL: "0123456789abcdef",
    NUMBERS: "0123456789",
    INT32_MIN: -2147483648,
    INT32_MAX: 2147483647
};
const NUMBER_PATTERN = /^-?\d+(\.\d+)?(e[+-]?\d+)?$/i;
const INTEGER_PATTERN = /^-?\d+$/;

export function Exception(message, response = {}, name = null) {
    const error = new Error(message);
    error.name = name || "Exception";
    error.response = response;
    if (checkEmpty(response)) {
        error.response = {};
    }
    return error;
}

export function time() {
    return Math.floor(Date.now() / 1000);
}

export function sleepMs(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export function sleep(seconds) {
    return sleepMs(seconds * 1000);
}

export function promiseTimeout(milliseconds, promise) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Promise timed out after ${milliseconds}ms`)), milliseconds);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export function promiseSilent(promise) {
    return promise
        ?.then(() => {
        })
        ?.catch(() => {
        });
}

export async function forever(delayMs, task, onError = null, onFinally = null) {
    if (!isPositiveNumber(delayMs))
        throw new Error("delayMs must be a positive number");

    const update = (value) => {
        if (isPositiveNumber(value)) delayMs = value;
    };

    while (true) {
        try {
            update(await task());
        } catch (error) {
            if (onError) update(await onError(error));
        } finally {
            if (onFinally) {
                try {
                    update(await onFinally());
                } catch {
                }
            }
            await sleepMs(delayMs);
        }
    }
}

export async function retry(task, maxAttempts = 1, onError = null, {delayMs = 0, backoffFactor = 1} = {}) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await task();
        } catch (error) {
            if (onError) await onError(error, attempt);
            if (attempt >= maxAttempts) throw error;
            if (delayMs > 0) await sleepMs(delayMs * backoffFactor ** (attempt - 1));
        }
    }
}

export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export function splitTrim(string, separator = null) {
    return string.split(separator ?? /\r?\n/).map(item => item.trim()).filter(Boolean);
}

export function checkEmpty(value) {
    if (typeof value === "number") return value === 0;
    return isEmpty(value);
}

export function pascalCase(string) {
    return upperFirst(camelCase(string));
}

export function titleCase(string, separator = " ") {
    return (string || "").split(separator).map(upperFirst).join(separator);
}

export function isInt32(value) {
    return Number.isInteger(value) && value >= CONSTANTS.INT32_MIN && value <= CONSTANTS.INT32_MAX;
}

export function isPositiveNumber(value) {
    return Number.isFinite(value) && value > 0;
}

export function coerceObjectNumbers(object) {
    for (const key of Object.keys(object)) {
        const value = object[key];
        if (typeof value === 'string' && NUMBER_PATTERN.test(value)) {
            object[key] = parseFloat(value);
        }
    }
    return object;
}

export function coerceObjectIntegers(object) {
    for (const key of Object.keys(object)) {
        const value = object[key];
        if (typeof value === 'string' && INTEGER_PATTERN.test(value)) {
            object[key] = parseInt(value);
        }
    }
    return object;
}

export function findNodeByKey(key, node, pair = null) {
    if (node && typeof node === 'object') {
        if (Object.hasOwn(node, key) && (pair === null || node[key] === pair)) {
            return node;
        }
        for (const childKey of Object.keys(node)) {
            const result = findNodeByKey(key, node[childKey], pair);
            if (result) return result;
        }
    }
    return null;
}

export function waitForProperty(object, property, timeoutMs, interval = 100) {
    return new Promise((resolve, reject) => {
        if (Object.hasOwn(object, property)) {
            resolve(object[property]);
            return;
        }
        const startTime = Date.now();
        const checkProperty = setInterval(() => {
            if (Object.hasOwn(object, property)) {
                clearInterval(checkProperty);
                resolve(object[property]);
            } else if (Date.now() - startTime >= timeoutMs) {
                clearInterval(checkProperty);
                reject(new Error(`Property "${property}" did not appear within ${timeoutMs}ms`));
            }
        }, interval);
    });
}

export function shuffleObject(object) {
    return Object.fromEntries(shuffle(Object.entries(object)));
}

export function objectStringify(object) {
    for (const key of Object.keys(object)) {
        const value = object[key];
        if (value !== null && typeof value === 'object') {
            objectStringify(value);
        } else {
            object[key] = String(value);
        }
    }
    return object;
}

export function castString(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        try {
            return JSON.stringify(value);
        } catch {
            return '{}';
        }
    }
    return String(value);
}

export function limitString(string, limit = 35, omission = "...") {
    string = string || "";
    if (string.length <= limit) return string;
    return string.slice(0, limit - omission.length) + omission;
}

export function safeString(string) {
    return xss(string || "", {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed", "form"],
        css: false
    });
}

export function shuffleString(string) {
    return shuffle(string.split('')).join('');
}

export function randomBoolean() {
    return Math.random() < 0.5;
}

export function randomString(length, useNumbers = true, useUppercase = false) {
    let characters = CONSTANTS.LOWER_CASE;
    if (useUppercase) characters += CONSTANTS.UPPER_CASE;
    if (useNumbers) characters += CONSTANTS.NUMBERS;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters[(Math.random() * characters.length) | 0];
    }
    return result;
}

export function randomHex(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += CONSTANTS.HEXADECIMAL[(Math.random() * 16) | 0];
    }
    return result;
}

export function randomInteger(min, max = undefined) {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new Error('min and max must be numerical values');
    }
    if (max <= min) {
        throw new Error('max must be greater than min');
    }
    return Math.floor(Math.random() * (max - min)) + min;
}

export function randomUuid(useDashes = true) {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
    return useDashes ? uuid : uuid.replaceAll("-", "");
}

export function randomWeighted(object) {
    if (checkEmpty(object)) return undefined;
    const elements = Object.keys(object);
    const weights = Object.values(object);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomNum = Math.random() * totalWeight;
    let weightSum = 0;
    for (let i = 0; i < elements.length; i++) {
        weightSum += weights[i];
        if (randomNum < weightSum) {
            return elements[i];
        }
    }
}

export function randomElement(object) {
    if (checkEmpty(object)) return undefined;
    const values = Array.isArray(object) ? object : Object.values(object);
    if (values.length === 0) return undefined;
    return values[Math.floor(Math.random() * values.length)];
}

export function mulberry32(seed) {
    if (typeof seed === "string") {
        let h = 0;
        for (let i = 0; i < seed.length; i++) {
            h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
        }
        seed = h >>> 0;
    }
    return function () {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function seedHex(seed, length) {
    const rng = mulberry32(String(seed));
    let result = '';
    while (result.length < length) {
        result += Math.floor(rng() * 0x100000000).toString(16).padStart(8, '0');
    }
    return result.slice(0, length);
}

export function cookiesFromResponse(response, decodeValues = false) {
    const obj = {};
    const cookies = setCookieParser.parse(response, {decodeValues});
    for (const cookie of cookies) {
        obj[cookie.name] = cookie.value;
    }
    return obj;
}

export function cookiesToHeader(cookies) {
    if (!cookies) return "";
    return Object.entries(cookies)
        .filter(([, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ");
}

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

export function isTransientHttpCode(httpCode) {
    return (
        !httpCode ||
        isNaN(httpCode) ||
        httpCode === 100 ||
        httpCode === 402 ||
        httpCode === 407 ||
        (460 <= httpCode && httpCode < 470) ||
        500 <= httpCode
    );
}

export function getResponseError(error, limit = 200) {
    let response;
    if (error?.response?.status && error.response.data) {
        response = `${error.response.status}|${error.response.data}`;
    } else if (error?.response?.data) {
        response = error.response.data;
    }
    return limitString(response || error.message, limit).trim();
}

export function normalizeProxy(proxy, protocol = "http") {
    proxy = proxy?.trim();
    if (!proxy) return null;

    const schemeMatch = proxy.match(/^([a-z][a-z0-9+.-]*):\/\/(.+)$/i);
    if (schemeMatch) {
        protocol = schemeMatch[1];
        proxy = schemeMatch[2];
    }

    let auth = "";
    let body = proxy;

    const atIdx = body.lastIndexOf("@");
    if (atIdx !== -1) {
        auth = body.slice(0, atIdx) + "@";
        body = body.slice(atIdx + 1);
    }

    if (!auth) {
        /* Note: when host is single-token (e.g. "localhost") AND password is all-digit port-shaped,
         the heuristic stays ambiguous; prefer `user:pass@host:port` for those cases. */
        const parts = body.split(":");
        const isPort = (s) => /^\d+$/.test(s) && +s >= 1 && +s <= 65535;
        const isHost = (s) => s.includes(".") || /[a-z]/i.test(s);
        if (parts.length === 4) {
            if (isPort(parts[3]) && !isPort(parts[1])) {
                // user:pass:host:port
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}`;
            } else if (isPort(parts[1]) && !isPort(parts[3])) {
                // host:port:user:pass
                auth = `${parts[2]}:${parts[3]}@`;
                body = `${parts[0]}:${parts[1]}`;
            } else if (isHost(parts[2]) && !isHost(parts[0])) {
                // user:pass:host:port (ambiguous; host detected at parts[2])
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}`;
            } else {
                // host:port:user:pass (ambiguous fallback)
                auth = `${parts[2]}:${parts[3]}@`;
                body = `${parts[0]}:${parts[1]}`;
            }
        } else if (parts.length === 5) {
            if (isPort(parts[3]) && isPort(parts[4]) && !isPort(parts[1])) {
                // user:pass:host:portStart:portEnd
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}:${parts[4]}`;
            } else if (isPort(parts[1]) && isPort(parts[2]) && !isPort(parts[3])) {
                // host:portStart:portEnd:user:pass
                auth = `${parts[3]}:${parts[4]}@`;
                body = `${parts[0]}:${parts[1]}:${parts[2]}`;
            } else if (isHost(parts[2]) && !isHost(parts[0])) {
                // user:pass:host:portStart:portEnd (ambiguous; host detected at parts[2])
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}:${parts[4]}`;
            } else {
                // host:portStart:portEnd:user:pass (ambiguous fallback)
                auth = `${parts[3]}:${parts[4]}@`;
                body = `${parts[0]}:${parts[1]}:${parts[2]}`;
            }
        }
    }

    const parts = body.split(":");
    if (parts.length === 3) {
        const start = Number(parts[1]);
        const end = Number(parts[2]);
        if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && start <= end) {
            body = `${parts[0]}:${randomInteger(start, end + 1)}`;
        }
    }

    return `${protocol}://${auth}${body}`;
}

export function parseProxy(proxy, protocol = "http") {
    const normalized = normalizeProxy(proxy, protocol);
    if (!normalized) return null;

    const [scheme, rest] = normalized.split("://");
    const atIdx = rest.lastIndexOf("@");
    const authPart = atIdx === -1 ? null : rest.slice(0, atIdx);
    const hostPart = atIdx === -1 ? rest : rest.slice(atIdx + 1);

    const [host, port] = hostPart.split(":");
    const result = {
        protocol: scheme,
        host,
        port: parseInt(port, 10),
    };

    if (authPart !== null) {
        const colonIdx = authPart.indexOf(":");
        const [username, password] = colonIdx === -1
            ? [authPart, ""]
            : [authPart.slice(0, colonIdx), authPart.slice(colonIdx + 1)];
        result.auth = {username, password};
    }

    return result;
}

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