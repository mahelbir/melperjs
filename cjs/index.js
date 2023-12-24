"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CONSTANTS = void 0;
exports.Exception = Exception;
exports.checkEmpty = checkEmpty;
exports.cookieDict = cookieDict;
exports.cookieHeader = cookieHeader;
exports.findKeyNode = findKeyNode;
exports.isIntlError = isIntlError;
exports.isIntlHttpCode = isIntlHttpCode;
exports.limitString = limitString;
exports.lowerCaseFirst = lowerCaseFirst;
exports.pascalCase = pascalCase;
exports.promiseTimeout = promiseTimeout;
exports.randomHex = randomHex;
exports.randomInteger = randomInteger;
exports.randomString = randomString;
exports.randomUuid = randomUuid;
exports.randomWeighted = randomWeighted;
exports.safeString = safeString;
exports.sleep = sleep;
exports.sleepMs = sleepMs;
exports.splitLines = splitLines;
exports.time = time;
exports.titleCase = titleCase;
exports.upperCaseFirst = upperCaseFirst;
var _xss = _interopRequireDefault(require("xss"));
var _setCookieParser = _interopRequireDefault(require("set-cookie-parser"));
var _camelCase = _interopRequireDefault(require("lodash/camelCase.js"));
var _capitalize = _interopRequireDefault(require("lodash/capitalize.js"));
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const CONSTANTS = exports.CONSTANTS = {
  LOWER_CASE: "abcdefghijklmnopqrstuvwxyz",
  UPPER_CASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  HEXADECIMAL: "0123456789abcdef",
  NUMBERS: "0123456789"
};
function Exception(message, response = {}, name = null) {
  response.status = response.status || 400;
  return {
    name: pascalCase(name),
    message,
    response
  };
}
function time() {
  return Math.floor(Date.now() / 1000);
}
async function sleepMs(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
async function sleep(seconds) {
  return await sleepMs(seconds * 1000);
}
function promiseTimeout(milliseconds, promise) {
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
function splitLines(text) {
  return text.split(/\r?\n/).map(item => item.trim()).filter(item => !(0, _isEmpty.default)(item));
}
function findKeyNode(key, node, pair = null) {
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
function checkEmpty(value) {
  if (typeof value === "number") {
    return value === 0;
  } else {
    return (0, _isEmpty.default)(value);
  }
}
function pascalCase(str) {
  return upperCaseFirst((0, _camelCase.default)(str));
}
function upperCaseFirst(str) {
  str = str || "";
  if (str.length < 1) return "";
  return str[0].toUpperCase() + str.slice(1);
}
function lowerCaseFirst(str) {
  str = str || "";
  if (str.length < 1) return "";
  return str[0].toLowerCase() + str.slice(1);
}
function titleCase(str) {
  str = str || "";
  return str.split(' ').map(word => (0, _capitalize.default)(word)).join(' ');
}
function limitString(str, limit = 35) {
  str = str || "";
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit - 3) + "...";
  }
}
function safeString(str) {
  str = str || "";
  return (0, _xss.default)(str, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"]
  });
}
function randomString(length, useNumbers = true, useUppercase = false) {
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
function randomHex(length) {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CONSTANTS.HEXADECIMAL.length);
    result += CONSTANTS.HEXADECIMAL[randomIndex];
  }
  return result;
}
function randomInteger(min, max, callback) {
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
function randomUuid(useDashes = true) {
  let d = Date.now();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return useDashes ? uuid : uuid.replaceAll("-", "");
}
function randomWeighted(dict, randomFunc = totalWeight => Math.random() * totalWeight) {
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
function cookieDict(res, decodeValues = false) {
  let dict = {};
  const cookies = _setCookieParser.default.parse(res, {
    decodeValues: decodeValues
  });
  for (let cookie of cookies) {
    dict[cookie.name] = cookie.value;
  }
  return dict;
}
function cookieHeader(cookieDict) {
  return Object.entries(cookieDict).map(([key, value]) => `${key}=${value}`).join(';');
}
function isIntlHttpCode(httpCode) {
  return httpCode === undefined || httpCode === null || httpCode === 0 || httpCode === 100 || httpCode === 402 || httpCode === 407 || 460 <= httpCode && httpCode < 470 || 500 <= httpCode;
}
function isIntlError(e) {
  return e?.message?.toLowerCase?.()?.includes?.("timeout") || e?.message?.toLowerCase?.()?.includes?.("aborted") || e?.message?.toLowerCase?.()?.includes?.("tls connection") || e?.message?.toLowerCase?.()?.includes?.("socket hang") || isIntlHttpCode(e?.response?.status);
}
//# sourceMappingURL=index.js.map