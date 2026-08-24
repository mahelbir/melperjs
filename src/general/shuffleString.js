import {shuffle} from "es-toolkit/array";

export function shuffleString(string) {
    return shuffle(string.split('')).join('');
}
