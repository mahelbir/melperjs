import {NUMBER_PATTERN} from "../helpers/general.js";

export function coerceObjectNumbers(object) {
    for (const key of Object.keys(object)) {
        const value = object[key];
        if (typeof value === 'string' && NUMBER_PATTERN.test(value)) {
            object[key] = parseFloat(value);
        }
    }
    return object;
}
