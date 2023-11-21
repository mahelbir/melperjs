"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Exception = Exception;
exports.cookieDict = cookieDict;
exports.cookieHeader = cookieHeader;
exports.findKeyNode = findKeyNode;
exports.foreignHttpError = foreignHttpError;
exports.hashBcrypt = hashBcrypt;
exports.isEmpty = isEmpty;
exports.limitString = limitString;
exports.promiseTimeout = promiseTimeout;
exports.randomHex = randomHex;
exports.randomString = randomString;
exports.randomUuid = randomUuid;
exports.randomWeighted = randomWeighted;
exports.safeString = safeString;
exports.sleep = sleep;
exports.sleepMs = sleepMs;
exports.time = time;
exports.verifyBcrypt = verifyBcrypt;
var _ = _interopRequireWildcard(require("lodash"));
var _xss = _interopRequireDefault(require("xss"));
var _bcrypt = _interopRequireDefault(require("bcrypt"));
var _setCookieParser = _interopRequireDefault(require("set-cookie-parser"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function Exception(message, response = {}) {
  response.status = response.status || 400;
  return {
    message: message,
    response: response
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
function isEmpty(value) {
  if (typeof value === "number") {
    return value === 0;
  } else {
    return _.isEmpty(value);
  }
}
function limitString(str, limit = 35) {
  str = str || "";
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit - 3) + "...";
  }
}
function safeString(source) {
  return (0, _xss.default)(source, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"]
  });
}
function randomString(length, useNumbers = true, useUppercase = false) {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let characters = lowercaseChars;
  if (useUppercase) characters += uppercaseChars;
  if (useNumbers) characters += numbers;
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}
function randomHex(length) {
  let result = '';
  const characters = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
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
function hashBcrypt(plainText) {
  return _bcrypt.default.hashSync(plainText, _bcrypt.default.genSaltSync(10));
}
function verifyBcrypt(plainText, hash) {
  return _bcrypt.default.compareSync(plainText, hash);
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
function foreignHttpError(httpCode) {
  return httpCode === undefined || httpCode === null || httpCode === 0 || httpCode === 402 || httpCode === 407 || httpCode === 466 || 500 <= httpCode;
}