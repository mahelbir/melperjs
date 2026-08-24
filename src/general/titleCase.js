import {upperFirst} from "es-toolkit/string";

export function titleCase(string, separator = " ") {
    return (string || "").split(separator).map(upperFirst).join(separator);
}
