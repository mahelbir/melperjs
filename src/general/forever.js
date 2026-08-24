import {isPositiveNumber} from "./isPositiveNumber.js";
import {sleepMs} from "./sleepMs.js";

export async function forever(delayMs, task, onError = null, onFinally = null) {
    if (!isPositiveNumber(delayMs))
        throw new Error("delayMs must be a positive number");

    const update = (value) => {
        if (isPositiveNumber(value)) delayMs = value;
    };

    while (true) {
        try {
            update(await task());
        } catch (error) {
            if (onError) update(await onError(error));
        } finally {
            if (onFinally) {
                try {
                    update(await onFinally());
                } catch {
                }
            }
            await sleepMs(delayMs);
        }
    }
}
