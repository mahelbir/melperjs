import {promises as fsp} from "fs";

export async function clearDirectory(directoryPath, keepDir = true) {
    await fsp.rm(directoryPath, {recursive: true, force: true});
    if (keepDir) await fsp.mkdir(directoryPath, {recursive: true});
}
