import {checkEmpty} from "./checkEmpty.js";

export function randomElement(object) {
    if (checkEmpty(object)) return undefined;
    const values = Array.isArray(object) ? object : Object.values(object);
    if (values.length === 0) return undefined;
    return values[Math.floor(Math.random() * values.length)];
}
