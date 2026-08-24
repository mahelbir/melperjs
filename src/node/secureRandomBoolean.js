import {secureRandomInteger} from "./secureRandomInteger.js";

export function secureRandomBoolean() {
    return secureRandomInteger(2) === 1;
}
