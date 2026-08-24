import bcrypt from "bcryptjs";

import {BCRYPT_STRENGTH, bcryptInput} from "../helpers/node.js";

export function bcryptHash(plainText, {key = "", preHash = true, strength = BCRYPT_STRENGTH} = {}) {
    return bcrypt.hashSync(bcryptInput(plainText, key, preHash), strength);
}
