export function splitTrim(string, separator = null) {
    return string.split(separator ?? /\r?\n/).map(item => item.trim()).filter(Boolean);
}
