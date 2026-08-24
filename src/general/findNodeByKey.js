export function findNodeByKey(key, node, pair = null) {
    if (node && typeof node === 'object') {
        if (Object.hasOwn(node, key) && (pair === null || node[key] === pair)) {
            return node;
        }
        for (const childKey of Object.keys(node)) {
            const result = findNodeByKey(key, node[childKey], pair);
            if (result) return result;
        }
    }
    return null;
}
