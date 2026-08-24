import crypto from "crypto";
import {exec} from "child_process";
import {promisify} from "util";

export const BCRYPT_STRENGTH = 12;

export const execAsync = promisify(exec);
export const sleepBuffer = new Int32Array(new SharedArrayBuffer(4));

export function digest(algorithm, data) {
    return crypto.createHash(algorithm).update(data).digest("hex");
}

export function bcryptInput(plainText, key, preHash) {
    const input = plainText + key;
    return preHash ? digest("sha256", input) : input;
}
