import crypto from "crypto";

export function secureRandomUuid(useDashes = true) {
    const uuid = crypto.randomUUID();
    return useDashes ? uuid : uuid.replaceAll("-", "");
}
