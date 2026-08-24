import {sleepMs} from "./sleepMs.js";

export function sleep(seconds) {
    return sleepMs(seconds * 1000);
}
