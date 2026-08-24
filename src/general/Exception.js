import {checkEmpty} from "./checkEmpty.js";

export function Exception(message, response = {}, name = null) {
    const error = new Error(message);
    error.name = name || "Exception";
    error.response = response;
    if (checkEmpty(response)) {
        error.response = {};
    }
    return error;
}
