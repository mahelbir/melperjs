import {promises as fsp} from "fs";

export async function readJsonFile(filePath, defaultValue = {}) {
    try {
        const data = await fsp.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}
