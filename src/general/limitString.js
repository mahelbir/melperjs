export function limitString(string, limit = 35, omission = "...") {
    string = string || "";
    if (string.length <= limit) return string;
    return string.slice(0, limit - omission.length) + omission;
}
