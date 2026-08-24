import fs from "fs";
import {promises as fsp} from "fs";
import path from "path";
import crypto from "crypto";
import {networkInterfaces} from "os";
import {execFileSync} from "child_process";

import bcrypt from "bcryptjs";

import {CONSTANTS, checkEmpty} from "./general.js";
import {bcryptInput, digest, execAsync, sleepBuffer} from "./helpers/node.js";

export function secureRandomBoolean() {
    return secureRandomInteger(2) === 1;
}

export function secureRandomString(length, useNumbers = true, useUppercase = false) {
    let characters = CONSTANTS.LOWER_CASE;
    if (useUppercase) characters += CONSTANTS.UPPER_CASE;
    if (useNumbers) characters += CONSTANTS.NUMBERS;

    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters[secureRandomInteger(0, characters.length)];
    }
    return result;
}

export function secureRandomHex(length) {
    return crypto
        .randomBytes(Math.ceil(length / 2))
        .toString('hex')
        .slice(0, length);
}

export function secureRandomInteger(min, max = undefined) {
    return crypto.randomInt(min, max);
}

export function secureRandomUuid(useDashes = true) {
    const uuid = crypto.randomUUID();
    return useDashes ? uuid : uuid.replaceAll("-", "");
}

export function secureRandomWeighted(object) {
    if (checkEmpty(object)) return undefined;
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
    if (checkEmpty(object)) return undefined;
    const values = Array.isArray(object) ? object : Object.values(object);
    if (values.length === 0) return undefined;
    return values[secureRandomInteger(0, values.length)];
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
    return digest(algorithm, data);
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
    return bcrypt.hashSync(bcryptInput(plainText, key, preHash), strength);
}

export function bcryptVerify(plainText, hash, {key = "", preHash = true} = {}) {
    return bcrypt.compareSync(bcryptInput(plainText, key, preHash), hash);
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

export function createNumberedDirs(mainDirectory, start = 0, end = 9) {
    fs.mkdirSync(mainDirectory, {recursive: true});
    for (let i = start; i <= end; i++) {
        fs.mkdirSync(path.join(mainDirectory, `${i}`), {recursive: true});
    }
}

export async function clearDirectory(directoryPath, keepDir = true) {
    await fsp.rm(directoryPath, {recursive: true, force: true});
    if (keepDir) await fsp.mkdir(directoryPath, {recursive: true});
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

export function sleepMsSync(milliseconds) {
    Atomics.wait(sleepBuffer, 0, 0, Math.max(0, Number(milliseconds) || 0));
}

export function sleepSync(seconds) {
    sleepMsSync(seconds * 1000);
}