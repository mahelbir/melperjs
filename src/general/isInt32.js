import {CONSTANTS} from "./CONSTANTS.js";

export function isInt32(value) {
    return Number.isInteger(value) && value >= CONSTANTS.INT32_MIN && value <= CONSTANTS.INT32_MAX;
}
