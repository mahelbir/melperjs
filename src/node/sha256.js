import {hash} from "./hash.js";

export function sha256(data) {
    return hash("sha256", data);
}
