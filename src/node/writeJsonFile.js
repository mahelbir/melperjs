import {promises as fsp} from "fs";

export function writeJsonFile(filePath, data) {
    const jsonData = JSON.stringify(data);
    return fsp.writeFile(filePath, jsonData, 'utf8');
}
