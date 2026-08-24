export function objectStringify(object) {
    for (const key of Object.keys(object)) {
        const value = object[key];
        if (value !== null && typeof value === 'object') {
            objectStringify(value);
        } else {
            object[key] = String(value);
        }
    }
    return object;
}
