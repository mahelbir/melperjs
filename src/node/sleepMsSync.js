import {sleepBuffer} from "../helpers/node.js";

export function sleepMsSync(milliseconds) {
    Atomics.wait(sleepBuffer, 0, 0, Math.max(0, Number(milliseconds) || 0));
}
