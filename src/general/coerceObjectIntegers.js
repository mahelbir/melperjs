import {INTEGER_PATTERN} from "../helpers/general.js";

export function coerceObjectIntegers(object) {
    for (const key of Object.keys(object)) {
        const value = object[key];
        if (typeof value === 'string' && INTEGER_PATTERN.test(value)) {
            object[key] = parseInt(value);
        }
    }
    return object;
}
