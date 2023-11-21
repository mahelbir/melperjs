import * as _ from "lodash";
import xss from "xss";
import bcrypt from "bcrypt";
import setCookieParser from "set-cookie-parser";

export function Exception(message, response = {}, name = null) {
    response.status = response.status || 400;
    return {
        name: pascalCase(name),
        message,
        response,
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

export function checkEmpty(value) {
    if (typeof value === "number") {
        return value === 0;
    } else {
        return _.isEmpty(value);
    }
}

export function pascalCase(str){
    return upperCaseFirst(_.camelCase(str));
}

export function upperCaseFirst(str) {
    str = str || "";
    return _.upperCase(str[0]) + str.slice(1);
}

export function lowerCaseFirst(str) {
    str = str || "";
    return _.lowerCase(str[0]) + str.slice(1);
}

export function titleString(str) {
    str = str || "";
    return str
        .split(' ')
        .map(word => _.capitalize(word))
        .join(' ');
}

export function limitString(str, limit = 35) {
    str = str || "";
    if (str.length <= limit) {
        return str;
    } else {
        return str.substring(0, limit - 3) + "...";
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

export function randomString(length, useNumbers = true, useUppercase = false) {
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';

    let characters = lowercaseChars;
    if (useUppercase) characters += uppercaseChars;
    if (useNumbers) characters += numbers;

    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters[randomIndex];
    }

    return randomString;
}

export function randomHex(length) {
    let result = '';
    const characters = '0123456789abcdef';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
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

export function randomWeighted(dict, randomFunc = (totalWeight) => Math.random() * totalWeight) {
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

export function hashBcrypt(plainText) {
    return bcrypt.hashSync(plainText, bcrypt.genSaltSync(10));
}

export function verifyBcrypt(plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
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

export function foreignHttpError(httpCode) {
    return (
        httpCode === undefined ||
        httpCode === null ||
        httpCode === 0 ||
        httpCode === 402 ||
        httpCode === 407 ||
        httpCode === 466 ||
        500 <= httpCode
    );
}