import fs from "fs";
import {promises as fsp} from "fs";
import path from "path";
import crypto from "crypto";
import {networkInterfaces} from "os";
import {execSync} from "child_process";

import bcrypt from "bcryptjs";

import {CONSTANTS, randomWeighted, splitClear} from "./index.js";


export function tokenString(length, useNumbers = true, useUppercase = false) {
    const lowercaseChars = CONSTANTS.LOWER_CASE;
    const uppercaseChars = CONSTANTS.UPPER_CASE;
    const numbers = CONSTANTS.NUMBERS;

    let characters = lowercaseChars;
    if (useUppercase) characters += uppercaseChars;
    if (useNumbers) characters += numbers;

    let randomString = '';
    while (randomString.length < length) {
        const byte = crypto.randomBytes(1)[0];
        const index = byte % characters.length;
        if (byte < (256 - (256 % characters.length))) {
            randomString += characters[index];
        }
    }

    return randomString;
}

export function tokenHex(length) {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export function tokenUuid(useDashes = true) {
    const uuid = crypto.randomUUID().toString();
    return useDashes ? uuid : uuid.replaceAll("-", "")
}

export function tokenWeighted(dict) {
    return randomWeighted(dict, crypto.randomInt);
}

export function tokenElement(obj) {
    if (Array.isArray(obj)) {
        return obj[crypto.randomInt(0, obj.length)];
    } else {
        return obj[tokenElement(Object.keys(obj))];
    }
}

export function serverIp() {
    const interfaces = networkInterfaces();
    for (const devName in interfaces) {
        const interfaceValue = interfaces[devName];
        for (let i = 0; i < interfaceValue.length; i++) {
            const alias = interfaceValue[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.address.startsWith("192.168.") && !alias.internal)
                return alias.address;
        }
    }
    return '127.0.0.1';
}

export function getVersion() {
    try {
        const date = new Date(execSync('git show -s --format=%ci HEAD').toString().trim());
        const formatDatePart = (value) => value.toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);
        const month = formatDatePart(date.getMonth() + 1);
        const day = formatDatePart(date.getDate());
        const hour = formatDatePart(date.getHours());
        const minute = formatDatePart(date.getMinutes());
        return `${year}${month}${day}.${hour}${minute}`;
    } catch {
        return "1.0";
    }
}

export function createNumDir(mainDirectory) {
    fs.mkdirSync(mainDirectory, {recursive: true});
    for (let i = 0; i <= 9; i++) {
        try {
            fs.mkdirSync(path.join(mainDirectory, i.toString()));
        } catch (e) {
            console.error(`createNumDir:${i}`, e.message);
        }
    }
}

export function md5(data) {
    return crypto.createHash('md5').update(data).digest("hex");
}

export function hashBcrypt(plainText, encryptionKey = "") {
    return bcrypt.hashSync(plainText + encryptionKey, bcrypt.genSaltSync(10));
}

export function verifyBcrypt(plainText, hash, encryptionKey = "") {
    return bcrypt.compareSync(plainText + encryptionKey, hash);
}

export function formatProxy(proxy, protocol = "http") {
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

export function proxyObject(...args) {
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

export function proxyValue(proxies) {
    let proxy;
    proxies = proxies || "";
    proxies = splitClear(proxies);
    if (proxies.length < 1)
        return null;
    proxy = proxies[crypto.randomInt(0, proxies.length)];
    proxy = formatProxy(proxy);
    proxy = proxy.replace("{SESSION}", tokenHex(8));
    return proxy || null;
}

export async function readJsonFile(filePath) {
    try {
        const data = await fsp.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

export function readJsonFileSync(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

export async function writeJsonFile(filePath, data) {
    const jsonData = JSON.stringify(data);
    return await fsp.writeFile(filePath, jsonData, 'utf8');
}

export function writeJsonFileSync(filePath, data) {
    const jsonData = JSON.stringify(data);
    return fs.writeFileSync(filePath, jsonData, 'utf8');
}
