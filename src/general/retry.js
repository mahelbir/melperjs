import {sleepMs} from "./sleepMs.js";

export async function retry(task, maxAttempts = 1, onError = null, {delayMs = 0, backoffFactor = 1} = {}) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await task();
        } catch (error) {
            if (onError) await onError(error, attempt);
            if (attempt >= maxAttempts) throw error;
            if (delayMs > 0) await sleepMs(delayMs * backoffFactor ** (attempt - 1));
        }
    }
}
