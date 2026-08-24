import {sleepMsSync} from "./sleepMsSync.js";

export function sleepSync(seconds) {
    sleepMsSync(seconds * 1000);
}
