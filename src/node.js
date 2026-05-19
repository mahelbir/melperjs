import fs from "fs";
import {promises as fsp} from "fs";
import path from "path";
import crypto from "crypto";
import {networkInterfaces} from "os";
import {exec, execFileSync} from "child_process";
import {promisify} from "util";

import bcrypt from "bcryptjs";

import {CONSTANTS, splitTrim, randomInteger, randomHex, seedHex} from "./index.js";


const execAsync = promisify(exec);

export function secureRandomBoolean() {
    return crypto.randomInt(2) === 0;
}

export function secureRandomString(length, useNumbers = true, useUppercase = false) {
    let characters = CONSTANTS.LOWER_CASE;
    if (useUppercase) characters += CONSTANTS.UPPER_CASE;
    if (useNumbers) characters += CONSTANTS.NUMBERS;

    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters[crypto.randomInt(0, characters.length)];
    }
    return result;
}

export function secureRandomHex(length) {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export function secureRandomInteger(min, max) {
    return crypto.randomInt(min, max);
}

export function secureRandomUuid(useDashes = true) {
    const uuid = crypto.randomUUID();
    return useDashes ? uuid : uuid.replaceAll("-", "");
}

export function secureRandomWeighted(object) {
    const elements = Object.keys(object);
    const weights = Object.values(object);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomNum = secureRandomInteger(0, totalWeight);
    let weightSum = 0;
    for (let i = 0; i < elements.length; i++) {
        weightSum += weights[i];
        if (randomNum < weightSum) {
            return elements[i];
        }
    }
}

export function secureRandomElement(object) {
    if (!object) return undefined;
    const values = Array.isArray(object) ? object : Object.values(object);
    if (values.length === 0) return undefined;
    return values[crypto.randomInt(0, values.length)];
}

export function uuidFromSeed(seed, useDashes = true) {
    const hash = crypto.createHash('md5').update(seed).digest();
    hash[6] = (hash[6] & 0x0f) | 0x30;
    hash[8] = (hash[8] & 0x3f) | 0x80;
    const hex = hash.toString('hex');
    if (!useDashes) return hex;
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function hash(algorithm, data) {
    return crypto.createHash(algorithm).update(data).digest("hex");
}

export function md5(data) {
    return hash("md5", data);
}

export function sha256(data) {
    return hash("sha256", data);
}

export function base64Encode(data) {
    return Buffer.from(data).toString('base64');
}

export function base64Decode(data, encoding = 'utf8') {
    return Buffer.from(data, 'base64').toString(encoding);
}

export function bcryptHash(plainText, {key = "", strength = 12, preHash = true} = {}) {
    let input = plainText + key;
    if (preHash) {
        input = sha256(input);
    }
    return bcrypt.hashSync(input, strength);
}

export function bcryptVerify(plainText, hash, {key = "", preHash = true} = {}) {
    let input = plainText + key;
    if (preHash) {
        input = sha256(input);
    }
    return bcrypt.compareSync(input, hash);
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
        // Note: when the password itself is all-digit and port-shaped (e.g. "admin:1234:host:port"),
        // the heuristic cannot distinguish auth-first from host-first ordering and may pick the wrong branch.
        const parts = body.split(":");
        const isPort = (s) => /^\d+$/.test(s) && +s >= 1 && +s <= 65535;
        if (parts.length === 4) {
            if (isPort(parts[3]) && !isPort(parts[1])) {
                // user:pass:host:port
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}`;
            } else {
                // host:port:user:pass (default)
                auth = `${parts[2]}:${parts[3]}@`;
                body = `${parts[0]}:${parts[1]}`;
            }
        } else if (parts.length === 5) {
            if (isPort(parts[3]) && isPort(parts[4]) && !isPort(parts[1])) {
                // user:pass:host:portStart:portEnd
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}:${parts[4]}`;
            } else {
                // host:portStart:portEnd:user:pass (default)
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
            body = `${parts[0]}:${crypto.randomInt(start, end + 1)}`;
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

    const {SESSION, ...rest} = replacements;
    let sessionValue;
    if (SESSION === undefined) {
        sessionValue = randomHex(8);
    } else if (typeof SESSION === "function") {
        sessionValue = SESSION();
    } else {
        sessionValue = seedHex(String(SESSION), 8);
    }

    let result = normalizeProxy(picked);
    if (!result) return null;
    result = result.replace("{SESSION}", sessionValue);
    for (const [key, value] of Object.entries(rest)) {
        const v = typeof value === "function" ? value() : String(value);
        result = result.replace(`{${key}}`, v);
    }
    return result;
}

export async function readJsonFile(filePath, defaultValue = {}) {
    try {
        const data = await fsp.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}

export function readJsonFileSync(filePath, defaultValue = {}) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}

export function writeJsonFile(filePath, data) {
    const jsonData = JSON.stringify(data);
    return fsp.writeFile(filePath, jsonData, 'utf8');
}

export function writeJsonFileSync(filePath, data) {
    const jsonData = JSON.stringify(data);
    return fs.writeFileSync(filePath, jsonData, 'utf8');
}

export async function clearDirectory(directoryPath, keepDir = true) {
    await fsp.rm(directoryPath, {recursive: true, force: true});
    if (keepDir) await fsp.mkdir(directoryPath, {recursive: true});
}

export function createNumberedDirs(mainDirectory, start = 0, end = 9) {
    fs.mkdirSync(mainDirectory, {recursive: true});
    for (let i = start; i <= end; i++) {
        fs.mkdirSync(path.join(mainDirectory, `${i}`), {recursive: true});
    }
}

export async function executeCommand(command) {
    const {stdout} = await execAsync(command);
    return stdout.trim();
}

export function hostIp() {
    for (const list of Object.values(networkInterfaces())) {
        for (const alias of list) {
            if (alias.family === 'IPv4' &&
                alias.address !== '127.0.0.1' &&
                !alias.address.startsWith('192.168.') &&
                !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

export function gitVersion() {
    try {
        const raw = execFileSync('git', ['show', '-s', '--format=%ct', 'HEAD'], {encoding: 'utf8'}).trim();
        const timestamp = parseInt(raw, 10);
        if (isNaN(timestamp)) return "1.0";
        const iso = new Date(timestamp * 1000).toISOString();
        return `${iso.slice(2, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}.${iso.slice(11, 13)}${iso.slice(14, 16)}`;
    } catch {
        return "1.0";
    }
}