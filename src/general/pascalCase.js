import {camelCase, upperFirst} from "es-toolkit/string";

export function pascalCase(string) {
    return upperFirst(camelCase(string));
}
