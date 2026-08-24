export function waitForProperty(object, property, timeoutMs, interval = 100) {
    return new Promise((resolve, reject) => {
        if (Object.hasOwn(object, property)) {
            resolve(object[property]);
            return;
        }
        const startTime = Date.now();
        const checkProperty = setInterval(() => {
            if (Object.hasOwn(object, property)) {
                clearInterval(checkProperty);
                resolve(object[property]);
            } else if (Date.now() - startTime >= timeoutMs) {
                clearInterval(checkProperty);
                reject(new Error(`Property "${property}" did not appear within ${timeoutMs}ms`));
            }
        }, interval);
    });
}
