const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {networkInterfaces} = require('os');
const {execSync} = require('child_process');

const _ = require('lodash');
const xss = require('xss');
const axios = require('axios');
const bcrypt = require('bcrypt');
const setCookieParser = require('set-cookie-parser');
const {HttpsProxyAgent} = require('hpagent');


function exception(message, response = {}) {
    response.status = response.status || 400;
    return {
        message: message,
        response: response
    }
}

function time() {
    return Math.floor(Date.now() / 1000);
}

async function sleepMs(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function sleep(seconds) {
    return await sleepMs(seconds * 1000);
}

function promiseTimeout(milliseconds, promise) {
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

function findKeyNode(key, node, pair = null) {
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

function isEmpty(value) {
    if (typeof value === "number") {
        return value === 0;
    } else {
        return _.isEmpty(value);
    }
}

function limitString(str, limit = 35) {
    str = str || "";
    if (str.length <= limit) {
        return str;
    } else {
        return str.substring(0, limit - 3) + "...";
    }
}

function safeString(source) {
    return xss(source, {
        whiteList: {},
        stripIgnoreTag: true,
        stripIgnoreTagBody: ["script"]
    });
}

function randomWeighted(dict) {
    let elements = Object.keys(dict);
    let weights = Object.values(dict);

    let totalWeight = 0;
    for (let weight of weights) {
        totalWeight += weight;
    }

    let randomNum = Math.random() * totalWeight;
    let weightSum = 0;

    for (let i = 0; i < elements.length; i++) {
        weightSum += weights[i];
        if (randomNum <= weightSum) {
            return elements[i];
        }
    }
}

function tokenHex(length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

function md5(data) {
    return crypto.createHash('md5').update(data).digest("hex");
}

function hashBcrypt(plainText) {
    return bcrypt.hashSync(plainText, bcrypt.genSaltSync(10));
}

function verifyBcrypt(plainText, hash) {
    return bcrypt.compareSync(plainText, hash);
}

function cookieDict(res, decodeValues = false) {
    let dict = {};
    const cookies = setCookieParser.parse(res, {decodeValues: decodeValues});
    for (let cookie of cookies) {
        dict[cookie.name] = cookie.value;
    }
    return dict;
}

function cookieHeader(cookieDict) {
    return Object.entries(cookieDict)
        .map(([key, value]) => `${key}=${value}`)
        .join(';')
}

function formatProxy(proxy, protocol = "http") {
    proxy = proxy.trim();
    const splitByProtocol = proxy.split("://");
    if (1 < splitByProtocol.length)
        protocol = splitByProtocol[0];
    proxy = splitByProtocol[splitByProtocol.length - 1];
    if (!proxy.includes("@")) {
        const proxyParts = proxy.split(":");
        if (4 <= proxyParts.length) {
            proxy = `${proxyParts[proxyParts.length - 2]}:${proxyParts[proxyParts.length - 1]}@`;
            proxyParts.pop();
            proxyParts.pop();
            proxy += proxyParts.join(":");
        }
    }
    const proxyParts = proxy.split(':');
    const proxyEnd = parseInt(proxyParts[proxyParts.length - 1]);
    const proxyStart = proxyParts[proxyParts.length - 2];
    if (!proxyStart.includes(".")) {
        proxyParts.pop();
        proxyParts[proxyParts.length - 1] = crypto.randomInt(parseInt(proxyStart), proxyEnd + 1).toString();
    }
    return protocol + "://" + proxyParts.join(':');
}

function proxyObject(...args) {
    let proxy = formatProxy(...args);
    const splitByProtocol = proxy.split('://');
    const splitById = splitByProtocol[splitByProtocol.length - 1].split('@');
    const splitByConn = splitById[splitById.length - 1].split(':');
    proxy = {
        protocol: splitByProtocol[0],
        host: splitByConn[0],
        port: parseInt(splitByConn[1]),
    };
    if (1 < splitById.length) {
        const splitByAuth = splitById[0].split(':');
        proxy.auth = {
            username: splitByAuth[0],
            password: splitByAuth[1]
        };
    }
    return proxy;
}

async function proxify(proxyConfig, callback = formatProxy) {
    proxyConfig = proxyConfig || {};
    const timeout = 7000;
    if (proxyConfig.mode === 1) {
        return callback(proxyConfig.proxy);
    } else if (proxyConfig.mode === 2) {
        const proxy = callback(proxyConfig.proxy);
        try {
            await axios.get(proxyConfig.resetApi, {timeout});
        } catch {
            return false;
        }
        await sleep(5);
        for (let i = 0; i < 5; i++) {
            try {
                const res = await axios.get("https://api64.ipify.org", {
                    timeout,
                    httpsAgent: new HttpsProxyAgent({proxy, timeout: 7000})
                });
                if (res.status === 200)
                    return proxy;
            } catch {
                await sleep(3);
            }
        }
    } else if (proxyConfig.mode === 3) {
        try {
            const res = await axios.get(proxyConfig.resetApi, {timeout});
            if (res.status === 200)
                return callback(proxyConfig.proxy);
        } catch {
            return false;
        }
    } else if (proxyConfig.mode === 4) {
        return callback(proxyConfig.proxy).replace("{SESSION}", tokenHex(8));
    } else if (proxyConfig.mode === 5) {
        try {
            const lines = proxyConfig.proxy.split("\n");
            const line = lines[crypto.randomInt(0, lines.length)];
            return callback(line);
        } catch {
            return false;
        }
    }

    return null;
}

function serverIP() {
    const interfaces = networkInterfaces();
    for (const devName in interfaces) {
        const interfaceValue = interfaces[devName];
        for (let i = 0; i < interfaceValue.length; i++) {
            const alias = interfaceValue[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }
    return '127.0.0.1';
}

function foreignError(httpCode) {
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

function createDir(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, {recursive: true});
        return true;
    }
    return null;
}

function createNumDir(mainDirectory) {
    if (createDir(mainDirectory)) {
        for (let i = 0; i <= 9; i++) {
            fs.mkdir(path.join(mainDirectory, i.toString()), (err) => {
                if (err)
                    console.error(err);
            });
        }
    }
}

function getVersion() {
    try {
        const date = new Date(execSync('git show -s --format=%ci HEAD').toString().trim());
        const formatDatePart = (value) => value.toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        const month = formatDatePart(date.getMonth() + 1);
        const day = formatDatePart(date.getDate());
        const hour = formatDatePart(date.getHours());
        const minute = formatDatePart(date.getMinutes());
        return parseFloat(`${year}${month}.${day}${hour}${minute}`);
    } catch {
        return 1.0;
    }
}

module.exports = {
    _,
    exception,
    time,
    sleepMs,
    sleep,
    promiseTimeout,
    findKeyNode,
    isEmpty,
    limitString,
    safeString,
    randomWeighted,
    tokenHex,
    md5,
    hashBcrypt,
    verifyBcrypt,
    cookieDict,
    cookieHeader,
    formatProxy,
    proxyObject,
    proxify,
    serverIP,
    foreignError,
    createDir,
    createNumDir,
    getVersion
};