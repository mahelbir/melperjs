import {CONSTANTS} from "./CONSTANTS.js";

export function randomHex(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += CONSTANTS.HEXADECIMAL[(Math.random() * 16) | 0];
    }
    return result;
}
