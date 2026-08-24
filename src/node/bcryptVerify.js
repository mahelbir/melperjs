import bcrypt from "bcryptjs";

import {BCRYPT_STRENGTH, bcryptInput} from "../helpers/node.js";

export function bcryptVerify(plainText, hash, {key = "", preHash = true, dummy = false} = {}) {
    const input = bcryptInput(plainText, key, preHash);
    if (dummy && !hash) {
        bcrypt.hashSync(input, typeof dummy === "number" ? dummy : BCRYPT_STRENGTH);
        return false;
    }
    return bcrypt.compareSync(input, hash);
}
