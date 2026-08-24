import {CONSTANTS} from "./CONSTANTS.js";

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
