import {execAsync} from "../helpers/node.js";

export async function executeCommand(command) {
    const {stdout} = await execAsync(command);
    return stdout.trim();
}
