export function unwrapDefault(value) {
    const seen = new WeakSet();
    let current = value;
    while (current && typeof current === "object" && "default" in current && !seen.has(current)) {
        seen.add(current);
        current = current.default;
    }
    return current;
}
