import {shuffle} from "es-toolkit/array";

export function shuffleObject(object) {
    return Object.fromEntries(shuffle(Object.entries(object)));
}
