import fs from "fs";
import path from "path";

export function createNumberedDirs(mainDirectory, start = 0, end = 9) {
    fs.mkdirSync(mainDirectory, {recursive: true});
    for (let i = start; i <= end; i++) {
        fs.mkdirSync(path.join(mainDirectory, `${i}`), {recursive: true});
    }
}
