import isEmpty from "es-toolkit/compat/isEmpty";

export function checkEmpty(value) {
    if (typeof value === "number") return value === 0;
    return isEmpty(value);
}
