import {networkInterfaces} from "os";

export function hostIp() {
    for (const list of Object.values(networkInterfaces())) {
        for (const alias of list) {
            if (alias.family === 'IPv4' &&
                alias.address !== '127.0.0.1' &&
                !alias.address.startsWith('192.168.') &&
                !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}
