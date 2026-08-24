import {CONSTANTS} from "../general/CONSTANTS.js";
import {secureRandomInteger} from "./secureRandomInteger.js";

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
