export function sleepMs(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}
