import {MUTATOR_METHODS} from "../helpers/general.js";

export function deepFreeze(value) {
    const seen = new WeakSet();
    const blocked = () => {
        throw new TypeError("Cannot mutate a frozen object");
    };

    const walk = (target) => {
        if (target === null || (typeof target !== "object" && typeof target !== "function")) return target;
        if (seen.has(target)) return target;
        seen.add(target);
        if (ArrayBuffer.isView(target)) return target;

        const tag = Object.prototype.toString.call(target).slice(8, -1);

        if (Object.isExtensible(target)) {
            for (const method of MUTATOR_METHODS[tag] || []) {
                if (typeof target[method] === "function") target[method] = blocked;
            }
        }

        if (tag === "Map") {
            for (const [key, item] of target) {
                walk(key);
                walk(item);
            }
        } else if (tag === "Set") {
            for (const item of target) walk(item);
        }

        for (const key of Reflect.ownKeys(target)) {
            if (typeof target === "function" && key === "prototype") continue;
            const descriptor = Object.getOwnPropertyDescriptor(target, key);
            if (descriptor && "value" in descriptor) walk(descriptor.value);
        }

        return tag === "RegExp" ? Object.seal(target) : Object.freeze(target);
    };

    return walk(value);
}
