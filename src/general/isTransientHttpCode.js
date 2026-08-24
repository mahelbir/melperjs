export function isTransientHttpCode(httpCode) {
    return (
        !httpCode ||
        isNaN(httpCode) ||
        httpCode === 100 ||
        httpCode === 402 ||
        httpCode === 407 ||
        (460 <= httpCode && httpCode < 470) ||
        500 <= httpCode
    );
}
