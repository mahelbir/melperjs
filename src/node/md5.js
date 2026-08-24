import {hash} from "./hash.js";

export function md5(data) {
    return hash("md5", data);
}
