import {FNV_OFFSET_BASIS, FNV_PRIME, TEXT_ENCODER} from "../helpers/general.js";
import {castString} from "./castString.js";

export function fnv1a(value) {
    let hash = FNV_OFFSET_BASIS;
    for (const byte of TEXT_ENCODER.encode(castString(value))) {
        hash ^= byte;
        hash = Math.imul(hash, FNV_PRIME);
    }
    return (hash >>> 0).toString(36);
}
