import {randomInteger} from "./randomInteger.js";

export function normalizeProxy(proxy, protocol = "http") {
    proxy = proxy?.trim();
    if (!proxy) return null;

    const schemeMatch = proxy.match(/^([a-z][a-z0-9+.-]*):\/\/(.+)$/i);
    if (schemeMatch) {
        protocol = schemeMatch[1];
        proxy = schemeMatch[2];
    }

    let auth = "";
    let body = proxy;

    const atIdx = body.lastIndexOf("@");
    if (atIdx !== -1) {
        auth = body.slice(0, atIdx) + "@";
        body = body.slice(atIdx + 1);
    }

    if (!auth) {
        /* Note: when host is single-token (e.g. "localhost") AND password is all-digit port-shaped,
         the heuristic stays ambiguous; prefer `user:pass@host:port` for those cases. */
        const parts = body.split(":");
        const isPort = (s) => /^\d+$/.test(s) && +s >= 1 && +s <= 65535;
        const isHost = (s) => s.includes(".") || /[a-z]/i.test(s);
        if (parts.length === 4) {
            if (isPort(parts[3]) && !isPort(parts[1])) {
                // user:pass:host:port
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}`;
            } else if (isPort(parts[1]) && !isPort(parts[3])) {
                // host:port:user:pass
                auth = `${parts[2]}:${parts[3]}@`;
                body = `${parts[0]}:${parts[1]}`;
            } else if (isHost(parts[2]) && !isHost(parts[0])) {
                // user:pass:host:port (ambiguous; host detected at parts[2])
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}`;
            } else {
                // host:port:user:pass (ambiguous fallback)
                auth = `${parts[2]}:${parts[3]}@`;
                body = `${parts[0]}:${parts[1]}`;
            }
        } else if (parts.length === 5) {
            if (isPort(parts[3]) && isPort(parts[4]) && !isPort(parts[1])) {
                // user:pass:host:portStart:portEnd
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}:${parts[4]}`;
            } else if (isPort(parts[1]) && isPort(parts[2]) && !isPort(parts[3])) {
                // host:portStart:portEnd:user:pass
                auth = `${parts[3]}:${parts[4]}@`;
                body = `${parts[0]}:${parts[1]}:${parts[2]}`;
            } else if (isHost(parts[2]) && !isHost(parts[0])) {
                // user:pass:host:portStart:portEnd (ambiguous; host detected at parts[2])
                auth = `${parts[0]}:${parts[1]}@`;
                body = `${parts[2]}:${parts[3]}:${parts[4]}`;
            } else {
                // host:portStart:portEnd:user:pass (ambiguous fallback)
                auth = `${parts[3]}:${parts[4]}@`;
                body = `${parts[0]}:${parts[1]}:${parts[2]}`;
            }
        }
    }

    const parts = body.split(":");
    if (parts.length === 3) {
        const start = Number(parts[1]);
        const end = Number(parts[2]);
        if (Number.isInteger(start) && Number.isInteger(end) && start >= 0 && start <= end) {
            body = `${parts[0]}:${randomInteger(start, end + 1)}`;
        }
    }

    return `${protocol}://${auth}${body}`;
}
