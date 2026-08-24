export function promiseSilent(promise) {
    return promise
        ?.then(() => {
        })
        ?.catch(() => {
        });
}
