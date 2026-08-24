import {checkEmpty} from "../general/checkEmpty.js";
import {secureRandomInteger} from "./secureRandomInteger.js";

export function secureRandomElement(object) {
    if (checkEmpty(object)) return undefined;
    const values = Array.isArray(object) ? object : Object.values(object);
    if (values.length === 0) return undefined;
    return values[secureRandomInteger(0, values.length)];
}
