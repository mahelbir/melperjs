import crypto from "crypto";

export function secureRandomInteger(min, max = undefined) {
    return crypto.randomInt(min, max);
}
