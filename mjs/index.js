import xss from "xss";
import setCookieParser from "set-cookie-parser";
import camelCase from "lodash/camelCase.js";
import capitalize from "lodash/capitalize.js";
import isEmpty from "lodash/isEmpty.js";
export const CONSTANTS = {
  LOWER_CASE: "abcdefghijklmnopqrstuvwxyz",
  UPPER_CASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  HEXADECIMAL: "0123456789abcdef",
  NUMBERS: "0123456789"
};
export function Exception(message, response = {}, name = null) {
  response.status = response.status || 400;
  return {
    name: pascalCase(name),
    message,
    response
  };
}
export function time() {
  return Math.floor(Date.now() / 1000);
}
export async function sleepMs(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
export async function sleep(seconds) {
  return await sleepMs(seconds * 1000);
}
export function promiseTimeout(milliseconds, promise) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Promise timed out after ' + milliseconds + 'ms'));
    }, milliseconds);
    promise.then(value => {
      clearTimeout(timer);
      resolve(value);
    }).catch(reason => {
      clearTimeout(timer);
      reject(reason);
    });
  });
}
export function splitLines(text) {
  return text.split(/\r?\n/).map(item => item.trim()).filter(item => !isEmpty(item));
}
export function findKeyNode(key, node, pair = null) {
  if (node && node.hasOwnProperty(key) && (pair ? node[key] === pair : true)) {
    return node;
  } else if (typeof node === 'object') {
    for (let index in node) {
      const result = findKeyNode(key, node[index], pair);
      if (result) {
        return result;
      }
    }
  }
  return null;
}
export function checkEmpty(value) {
  if (typeof value === "number") {
    return value === 0;
  } else {
    return isEmpty(value);
  }
}
export function pascalCase(str) {
  return upperCaseFirst(camelCase(str));
}
export function upperCaseFirst(str) {
  str = str || "";
  if (str.length < 1) return "";
  return str[0].toUpperCase() + str.slice(1);
}
export function lowerCaseFirst(str) {
  str = str || "";
  if (str.length < 1) return "";
  return str[0].toLowerCase() + str.slice(1);
}
export function titleCase(str) {
  str = str || "";
  return str.split(' ').map(word => capitalize(word)).join(' ');
}
export function limitString(str, limit = 35) {
  str = str || "";
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit - 3) + "...";
  }
}
export function safeString(str) {
  str = str || "";
  return xss(str, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"]
  });
}
export function randomString(length, useNumbers = true, useUppercase = false) {
  let characters = CONSTANTS.LOWER_CASE;
  if (useUppercase) characters += CONSTANTS.UPPER_CASE;
  if (useNumbers) characters += CONSTANTS.NUMBERS;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}
export function randomHex(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CONSTANTS.HEXADECIMAL.length);
    result += CONSTANTS.HEXADECIMAL[randomIndex];
  }
  return result;
}
export function randomInteger(min, max, callback) {
  const minNotSpecified = typeof max === 'undefined' || typeof max === 'function';
  if (minNotSpecified) {
    callback = max;
    max = min;
    min = 0;
  }
  const isSync = typeof callback === 'undefined';
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('min and max must be numerical values');
  }
  if (max <= min) {
    throw new Error('max must be greater than min');
  }
  const randomNumber = Math.floor(Math.random() * (max - min)) + min;
  if (isSync) {
    return randomNumber;
  } else {
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }
    callback(randomNumber);
  }
}
export function randomUuid(useDashes = true) {
  let d = Date.now();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return useDashes ? uuid : uuid.replaceAll("-", "");
}
export function randomWeighted(dict, randomFunc = totalWeight => Math.random() * totalWeight) {
  let elements = Object.keys(dict);
  let weights = Object.values(dict);
  let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let randomNum = randomFunc(totalWeight);
  let weightSum = 0;
  for (let i = 0; i < elements.length; i++) {
    weightSum += weights[i];
    if (randomNum <= weightSum) {
      return elements[i];
    }
  }
}
export function cookieDict(res, decodeValues = false) {
  let dict = {};
  const cookies = setCookieParser.parse(res, {
    decodeValues: decodeValues
  });
  for (let cookie of cookies) {
    dict[cookie.name] = cookie.value;
  }
  return dict;
}
export function cookieHeader(cookieDict) {
  return Object.entries(cookieDict).map(([key, value]) => `${key}=${value}`).join(';');
}
export function isIntlHttpCode(httpCode) {
  return httpCode === undefined || httpCode === null || httpCode === 0 || httpCode === 100 || httpCode === 402 || httpCode === 407 || 460 <= httpCode && httpCode < 470 || 500 <= httpCode;
}
export function isIntlError(e) {
  return e?.message?.toLowerCase?.()?.includes?.("timeout") || e?.message?.toLowerCase?.()?.includes?.("aborted") || e?.message?.toLowerCase?.()?.includes?.("tls connection") || e?.message?.toLowerCase?.()?.includes?.("socket hang") || isIntlHttpCode(e?.response?.status);
}
//# sourceMappingURL=index.js.map