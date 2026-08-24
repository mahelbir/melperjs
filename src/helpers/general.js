export const FNV_OFFSET_BASIS = 0x811c9dc5;
export const FNV_PRIME = 0x01000193;
export const TEXT_ENCODER = new TextEncoder();

export const NUMBER_PATTERN = /^-?\d+(\.\d+)?(e[+-]?\d+)?$/i;
export const INTEGER_PATTERN = /^-?\d+$/;
export const MUTATOR_METHODS = {
    Map: ["set", "delete", "clear"],
    Set: ["add", "delete", "clear"],
    WeakMap: ["set", "delete"],
    WeakSet: ["add", "delete"],
    Date: Object.getOwnPropertyNames(Date.prototype).filter(key => key.startsWith("set"))
};
