import fs from "fs";

export function writeJsonFileSync(filePath, data) {
    const jsonData = JSON.stringify(data);
    return fs.writeFileSync(filePath, jsonData, 'utf8');
}
