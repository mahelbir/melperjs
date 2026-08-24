export function randomInteger(min, max = undefined) {
    if (typeof max === 'undefined') {
        max = min;
        min = 0;
    }
    if (typeof min !== 'number' || typeof max !== 'number') {
        throw new Error('min and max must be numerical values');
    }
    if (max <= min) {
        throw new Error('max must be greater than min');
    }
    return Math.floor(Math.random() * (max - min)) + min;
}
