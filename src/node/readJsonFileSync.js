import fs from "fs";

export function readJsonFileSync(filePath, defaultValue = {}) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch {
        return defaultValue;
    }
}
