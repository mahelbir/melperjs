import {normalizeProxy} from "./normalizeProxy.js";

export function parseProxy(proxy, protocol = "http") {
    const normalized = normalizeProxy(proxy, protocol);
    if (!normalized) return null;

    const [scheme, rest] = normalized.split("://");
    const atIdx = rest.lastIndexOf("@");
    const authPart = atIdx === -1 ? null : rest.slice(0, atIdx);
    const hostPart = atIdx === -1 ? rest : rest.slice(atIdx + 1);

    const [host, port] = hostPart.split(":");
    const result = {
        protocol: scheme,
        host,
        port: parseInt(port, 10),
    };

    if (authPart !== null) {
        const colonIdx = authPart.indexOf(":");
        const [username, password] = colonIdx === -1
            ? [authPart, ""]
            : [authPart.slice(0, colonIdx), authPart.slice(colonIdx + 1)];
        result.auth = {username, password};
    }

    return result;
}
