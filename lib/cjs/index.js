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
exports.flipObject = flipObject;
exports.forever = forever;
exports.getResponseError = getResponseError;
exports.indexByTime = indexByTime;
exports.isInt32 = isInt32;
exports.isIntlHttpCode = isIntlHttpCode;
exports.isIntlHttpError = isIntlHttpError;
exports.isValidURL = isValidURL;
exports.limitString = limitString;
exports.modifyObjectKeys = modifyObjectKeys;
exports.objectStringify = objectStringify;
exports.parseIntFromObj = parseIntFromObj;
exports.parseNumFromObj = parseNumFromObj;
exports.pascalCase = pascalCase;
exports.promiseSilent = promiseSilent;
exports.promiseTimeout = promiseTimeout;
exports.randomElement = randomElement;
exports.randomHex = randomHex;
exports.randomInteger = randomInteger;
exports.randomString = randomString;
exports.randomUuid = randomUuid;
exports.randomWeighted = randomWeighted;
exports.retryFn = retryFn;
exports.safeString = safeString;
exports.shuffleObject = shuffleObject;
exports.shuffleString = shuffleString;
exports.sleep = sleep;
exports.sleepMs = sleepMs;
exports.splitClear = splitClear;
exports.time = time;
exports.titleCase = titleCase;
exports.waitForProperty = waitForProperty;
var _xss = _interopRequireDefault(require("xss"));
var _setCookieParser = _interopRequireDefault(require("set-cookie-parser"));
var _camelCase = _interopRequireDefault(require("lodash/camelCase.js"));
var _upperFirst = _interopRequireDefault(require("lodash/upperFirst.js"));
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty.js"));
var _shuffle = _interopRequireDefault(require("lodash/shuffle.js"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const CONSTANTS = exports.CONSTANTS = {
  LOWER_CASE: "abcdefghijklmnopqrstuvwxyz",
  UPPER_CASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  HEXADECIMAL: "0123456789abcdef",
  NUMBERS: "0123456789",
  INT32_MIN: -2147483648,
  INT32_MAX: 2147483647
};
function Exception(message, response = {}, name = null) {
  const error = new Error(message);
  error.name = name || "Exception";
  error.response = response;
  if (checkEmpty(response)) {
    error.response = {};
  }
  if (!error.response?.status) {
    error.response.status = 400;
  }
  return error;
}
async function forever(cooldown, onSuccess, onError = null, onCompleted = null) {
  const checkCooldown = value => value && !isNaN(value) && value > 0;
  if (!checkCooldown(cooldown)) throw new Error("Cooldown must be a positive number");
  while (true) {
    try {
      const value = await onSuccess();
      if (checkCooldown(value)) cooldown = value;
    } catch (e) {
      const value = onError && (await onError(e));
      if (checkCooldown(value)) cooldown = value;
    } finally {
      const value = onCompleted && (await onCompleted());
      if (checkCooldown(value)) cooldown = value;
      await sleepMs(cooldown);
    }
  }
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
function promiseSilent(promise) {
  return promise.then(() => {}).catch(() => {});
}
async function retryFn(fn, retries, errorFn = null) {
  let result = null;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      result = await fn();
      return result;
    } catch (error) {
      errorFn && (await errorFn(attempt, error, result));
      if (attempt >= retries) {
        throw error;
      }
    }
  }
}
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function splitClear(rawText, separator = null) {
  separator = separator ?? /\r?\n/;
  return rawText.split(separator).map(item => item.trim()).filter(item => !(0, _isEmpty.default)(item));
}
function checkEmpty(value) {
  if (typeof value === "number") {
    return value === 0;
  } else {
    return (0, _isEmpty.default)(value);
  }
}
function pascalCase(str) {
  return (0, _upperFirst.default)((0, _camelCase.default)(str));
}
function titleCase(str, separator = " ") {
  str = str || "";
  const words = str.split(separator);
  return words.map(word => (0, _upperFirst.default)(word)).join(separator);
}
function isInt32(value) {
  return Number.isInteger(value) && value >= CONSTANTS.INT32_MIN && value <= CONSTANTS.INT32_MAX;
}
function parseNumFromObj(obj) {
  for (let key in obj) {
    let value = obj[key];
    let number = parseFloat(value);
    if (typeof value === 'string' && !isNaN(number) && !value.includes("_")) {
      value = number;
    }
    obj[key] = value;
  }
  return obj;
}
function parseIntFromObj(obj) {
  for (let key in obj) {
    let value = obj[key];
    let number = parseInt(value);
    if (typeof value === 'string' && !isNaN(number) && value.length === number.toString().length) {
      value = number;
    }
    obj[key] = value;
  }
  return obj;
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
function waitForProperty(obj, propertyName, timeout = 5000, interval = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkProperty = setInterval(() => {
      if (obj.hasOwnProperty(propertyName)) {
        clearInterval(checkProperty);
        resolve();
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkProperty);
        reject(new Error(`Property ${propertyName} did not appear within ${timeout} milliseconds`));
      }
    }, interval);
  });
}
function flipObject(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [value, key]));
}
function shuffleObject(obj) {
  const arr = Object.entries(obj);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return Object.fromEntries(arr);
}
function objectStringify(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        objectStringify(obj[key]);
      } else {
        if (obj[key]?.toString) {
          obj[key] = obj[key].toString();
        } else {
          obj[key] = String(obj[key]);
        }
      }
    }
  }
  return obj;
}
function modifyObjectKeys(obj, callFn) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[callFn(key)] = obj[key];
    return acc;
  }, {});
}
function limitString(str, limit = 35, omission = "...") {
  str = str || "";
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit - omission.length) + omission;
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
function shuffleString(str) {
  const collection = str.split('');
  const shuffled = (0, _shuffle.default)(collection);
  return shuffled.join('');
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
function randomWeighted(dict, randomFunc = null) {
  randomFunc = randomFunc || (totalWeight => Math.random() * totalWeight);
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
function randomElement(obj) {
  if (Array.isArray(obj)) {
    return obj[Math.floor(Math.random() * obj.length)];
  } else {
    return obj[randomElement(Object.keys(obj))];
  }
}
function indexByTime(index) {
  const date = new Date();
  const hour = date.getHours();
  const minute = date.getMinutes();
  if (hour < 20) {
    return (index + hour) % 10;
  } else {
    const totalMinutes = (hour - 20) * 60 + minute;
    const minuteIndex = Math.floor(totalMinutes / 24);
    return (index + minuteIndex) % 10;
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
  return httpCode === undefined || httpCode === null || isNaN(httpCode) || httpCode === 0 || httpCode === 100 || httpCode === 402 || httpCode === 407 || httpCode === 417 || 460 <= httpCode && httpCode < 470 || 500 <= httpCode;
}
function isIntlHttpError(e) {
  const message = e?.message?.toLowerCase?.() || "";
  return message.includes("timeout") || message.includes("aborted") || message.includes("socket hang") || message.includes("proxy") || message.includes("tls connection") || message.includes("payment") || message.includes("expectation") || isIntlHttpCode(e?.response?.status);
}
function getResponseError(e, limit = 115) {
  let response;
  if (e?.response?.status && e.response.data) {
    response = `${e.response.status}|${e.response.data}`;
  } else if (e?.response?.data) {
    response = e.response.data;
  }
  return limitString(response || e.message, limit).trim();
}