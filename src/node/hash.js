import {digest} from "../helpers/node.js";

export function hash(algorithm, data) {
    return digest(algorithm, data);
}
