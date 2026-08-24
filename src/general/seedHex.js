import {mulberry32} from "./mulberry32.js";

export function seedHex(seed, length) {
    const rng = mulberry32(String(seed));
    let result = '';
    while (result.length < length) {
        result += Math.floor(rng() * 0x100000000).toString(16).padStart(8, '0');
    }
    return result.slice(0, length);
}
