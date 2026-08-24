import {execFileSync} from "child_process";

export function gitVersion() {
    try {
        const raw = execFileSync('git', ['show', '-s', '--format=%ct', 'HEAD'], {encoding: 'utf8'}).trim();
        const timestamp = parseInt(raw, 10);
        if (isNaN(timestamp)) return "1.0";
        const iso = new Date(timestamp * 1000).toISOString();
        return `${iso.slice(2, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}.${iso.slice(11, 13)}${iso.slice(14, 16)}`;
    } catch {
        return "1.0";
    }
}
