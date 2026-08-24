import {limitString} from "./limitString.js";

export function getResponseError(error, limit = 200) {
    let response;
    if (error?.response?.status && error.response.data) {
        response = `${error.response.status}|${error.response.data}`;
    } else if (error?.response?.data) {
        response = error.response.data;
    }
    return limitString(response || error.message, limit).trim();
}
