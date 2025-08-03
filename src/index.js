import xss from "xss";
import setCookieParser from "set-cookie-parser";
import camelCase from "lodash/camelCase.js";
import upperFirst from "lodash/upperFirst.js";
import isEmpty from "lodash/isEmpty.js";
import shuffle from "lodash/shuffle.js";


export const CONSTANTS = {
    LOWER_CASE: "abcdefghijklmnopqrstuvwxyz",
    UPPER_CASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    HEXADECIMAL: "0123456789abcdef",
    NUMBERS: "0123456789",
    INT32_MIN: -2147483648,
    INT32_MAX: 2147483647
};

export function Exception(message, response = {}, name = null) {
    const error = new Error(message);
    error.name = name || "Exception";
    error.response = response;
    if (checkEmpty(response)) {
        error.response = {};
    }
    if (!error.response?.status) {
        error.response.status = 400;
    }
    return error;
}

export async function forever(cooldown, onSuccess, onError = null, onCompleted = null) {
    const checkCooldown = (value) => value && !isNaN(value) && value > 0;
    if (!checkCooldown(cooldown))
        throw new Error("Cooldown must be a positive number");

    while (true) {
        try {
            const value = await onSuccess();
            if (checkCooldown(value))
                cooldown = value;
        } catch (e) {
            const value = onError && await onError(e);
            if (checkCooldown(value))
                cooldown = value;
        } finally {
            const value = onCompleted && await onCompleted();
            if (checkCooldown(value))
                cooldown = value;
            await sleepMs(cooldown);
        }
    }
}

export function time() {
    return Math.floor(Date.now() / 1000);
}

export async function sleepMs(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function sleep(seconds) {
    return await sleepMs(seconds * 1000);
}

export function promiseTimeout(milliseconds, promise) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error('Promise timed out after ' + milliseconds + 'ms'));
        }, milliseconds);

        promise
            .then(value => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch(reason => {
                clearTimeout(timer);
                reject(reason);
            });
    });
}

export function promiseSilent(promise) {
    return promise
        .then(() => {
        })
        .catch(() => {
        });
}

export async function retryFn(fn, retries, errorFn = null) {
    let result = null;
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            result = await fn();
            return result;
        } catch (error) {
            errorFn && await errorFn(attempt, error, result);
            if (attempt >= retries) {
                throw error;
            }
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

export function splitClear(rawText, separator = null) {
    separator = separator ?? /\r?\n/;
    return rawText.split(separator).map(item => item.trim()).filter(item => !isEmpty(item));
}

export function checkEmpty(value) {
    if (typeof value === "number") {
        return value === 0;
    } else {
        return isEmpty(value);
    }
}

export function pascalCase(str) {
    return upperFirst(camelCase(str));
}

export function titleCase(str, separator = " ") {
    str = str || "";
    const words = str.split(separator);
    return words.map(word => upperFirst(word)).join(separator);
}

export function isInt32(value) {
    return Number.isInteger(value) && value >= CONSTANTS.INT32_MIN && value <= CONSTANTS.INT32_MAX;
}

export function parseNumFromObj(obj) {
    for (let key in obj) {
        let value = obj[key];
        let number = parseFloat(value);
        if (typeof value === 'string' && !isNaN(number) && !value.includes("_")) {
            value = number;
        }
        obj[key] = value;
    }
    return obj;
}

export function parseIntFromObj(obj) {
    for (let key in obj) {
        let value = obj[key];
        let number = parseInt(value);
        if (typeof value === 'string' && !isNaN(number) && value.length === number.toString().length) {
            value = number;
        }
        obj[key] = value;
    }
    return obj;
}

export function findKeyNode(key, node, pair = null) {
    if (node && node.hasOwnProperty(key) && (pair ? node[key] === pair : true)) {
        return node;
    } else if (typeof node === 'object') {
        for (let index in node) {
            const result = findKeyNode(key, node[index], pair);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

export function waitForProperty(obj, propertyName, timeout = 5000, interval = 100) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkProperty = setInterval(() => {
            if (obj.hasOwnProperty(propertyName)) {
                clearInterval(checkProperty);
                resolve();
            } else if (Date.now() - startTime > timeout) {
                clearInterval(checkProperty);
                reject(new Error(`Property ${propertyName} did not appear within ${timeout} milliseconds`));
            }
        }, interval);
    });
}

export function flipObject(obj) {
    return Object.fromEntries(
        Object
            .entries(obj)
            .map(([key, value]) => [value, key])
    )
}

export function shuffleObject(obj) {
    const arr = Object.entries(obj);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return Object.fromEntries(arr);
}

export function objectStringify(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                objectStringify(obj[key]);
            } else {
                if (obj[key]?.toString) {
                    obj[key] = obj[key].toString();
                } else {
                    obj[key] = String(obj[key]);
                }
            }
        }
    }
    return obj;
}

export function modifyObjectKeys(obj, callFn) {
    return Object.keys(obj).reduce((acc, key) => {
        acc[callFn(key)] = obj[key];
        return acc;
    }, {});
}

export function limitString(str, limit = 35, omission = "...") {
    str = str || "";
    if (str.length <= limit) {
        return str;
    } else {
        return str.substring(0, limit - omission.length) + omission;
    }
}

export function safeString(str) {
    str = str || "";
    return xss(str, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script"]
    });
}

export function shuffleString(str) {
    const collection = str.split('');
    const shuffled = shuffle(collection);
    return shuffled.join('');
}

export function randomString(length, useNumbers = true, useUppercase = false) {

    let characters = CONSTANTS.LOWER_CASE;
    if (useUppercase) characters += CONSTANTS.UPPER_CASE;
    if (useNumbers) characters += CONSTANTS.NUMBERS;

    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    return randomString;
}

export function randomHex(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * CONSTANTS.HEXADECIMAL.length);
        result += CONSTANTS.HEXADECIMAL[randomIndex];
    }

    return result;
}

export function randomInteger(min, max, callback) {
    const minNotSpecified = typeof max === 'undefined' || typeof max === 'function';

    if (minNotSpecified) {
        callback = max;
        max = min;
        min = 0;
    }

    const isSync = typeof callback === 'undefined';

    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new Error('min and max must be numerical values');
    }
    if (max <= min) {
        throw new Error('max must be greater than min');
    }

    const randomNumber = Math.floor(Math.random() * (max - min)) + min;

    if (isSync) {
        return randomNumber;
    } else {
        if (typeof callback !== 'function') {
            throw new Error('callback must be a function');
        }
        callback(randomNumber);
    }
}

export function randomUuid(useDashes = true) {
    let d = Date.now();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return useDashes ? uuid : uuid.replaceAll("-", "");
}

export function randomWeighted(dict, randomFunc = null) {
    randomFunc = randomFunc || ((totalWeight) => Math.random() * totalWeight);
    let elements = Object.keys(dict);
    let weights = Object.values(dict);

    let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    let randomNum = randomFunc(totalWeight);
    let weightSum = 0;

    for (let i = 0; i < elements.length; i++) {
        weightSum += weights[i];
        if (randomNum <= weightSum) {
            return elements[i];
        }
    }
}

export function randomElement(obj) {
    if (Array.isArray(obj)) {
        return obj[Math.floor(Math.random() * obj.length)];
    } else {
        return obj[randomElement(Object.keys(obj))];
    }
}

export function indexByTime(index) {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    if (hour < 20) {
        return (index + hour) % 10;
    } else {
        const totalMinutes = (hour - 20) * 60 + minute;
        const minuteIndex = Math.floor(totalMinutes / 24);
        return (index + minuteIndex) % 10;
    }
}

export function cookieDict(res, decodeValues = false) {
    let dict = {};
    const cookies = setCookieParser.parse(res, {decodeValues: decodeValues});
    for (let cookie of cookies) {
        dict[cookie.name] = cookie.value;
    }
    return dict;
}

export function cookieHeader(cookieDict) {
    return Object.entries(cookieDict)
        .map(([key, value]) => `${key}=${value}`)
        .join(';')
}

export function isIntlHttpCode(httpCode) {
    return (
        httpCode === undefined ||
        httpCode === null ||
        isNaN(httpCode) ||
        httpCode === 0 ||
        httpCode === 100 ||
        httpCode === 402 ||
        httpCode === 407 ||
        httpCode === 417 ||
        (460 <= httpCode && httpCode < 470) ||
        500 <= httpCode
    );
}

export function isIntlHttpError(e) {
    const message = e?.message?.toLowerCase?.() || "";

    return (
        message.includes("timeout") ||
        message.includes("aborted") ||
        message.includes("socket hang") ||
        message.includes("proxy") ||
        message.includes("tls connection") ||
        message.includes("payment") ||
        message.includes("expectation") ||
        isIntlHttpCode(e?.response?.status)
    )
}

export function getResponseError(e, limit = 115) {
    let response;
    if (e?.response?.status && e.response.data) {
        response = `${e.response.status}|${e.response.data}`;
    } else if (e?.response?.data) {
        response = e.response.data;
    }
    return limitString(response || e.message, limit).trim();
}