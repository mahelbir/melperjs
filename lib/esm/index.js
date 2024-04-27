function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }
function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }
import xss from "xss";
import setCookieParser from "set-cookie-parser";
import camelCase from "lodash/camelCase.js";
import upperFirst from "lodash/upperFirst.js";
import isEmpty from "lodash/isEmpty.js";
export var CONSTANTS = {
  LOWER_CASE: "abcdefghijklmnopqrstuvwxyz",
  UPPER_CASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  HEXADECIMAL: "0123456789abcdef",
  NUMBERS: "0123456789"
};
export function Exception(message) {
  var response = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var name = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  class ExceptionClass extends Error {
    constructor(message, response, name) {
      super(message);
      response.status = response.status || 400;
      this.response = response;
      this.name = name ? pascalCase(name) : "Exception";
    }
  }
  return new ExceptionClass(message, response, name);
}
export function forever(_x, _x2) {
  return _forever.apply(this, arguments);
}
function _forever() {
  _forever = _asyncToGenerator(function* (cooldown, onSuccess) {
    var onError = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var onCompleted = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
    var checkCooldown = value => value && !isNaN(value) && value > 0;
    if (!checkCooldown(cooldown)) throw new Error("Cooldown must be a positive number");
    while (true) {
      try {
        var value = yield onSuccess();
        if (checkCooldown(value)) cooldown = value;
      } catch (e) {
        var _value = onError && (yield onError(e));
        if (checkCooldown(_value)) cooldown = _value;
      } finally {
        var _value2 = onCompleted && (yield onCompleted());
        if (checkCooldown(_value2)) cooldown = _value2;
        yield sleepMs(cooldown);
      }
    }
  });
  return _forever.apply(this, arguments);
}
export function time() {
  return Math.floor(Date.now() / 1000);
}
export function sleepMs(_x3) {
  return _sleepMs.apply(this, arguments);
}
function _sleepMs() {
  _sleepMs = _asyncToGenerator(function* (milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  });
  return _sleepMs.apply(this, arguments);
}
export function sleep(_x4) {
  return _sleep.apply(this, arguments);
}
function _sleep() {
  _sleep = _asyncToGenerator(function* (seconds) {
    return yield sleepMs(seconds * 1000);
  });
  return _sleep.apply(this, arguments);
}
export function promiseTimeout(milliseconds, promise) {
  return new Promise((resolve, reject) => {
    var timer = setTimeout(() => {
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
export function splitClear(rawText) {
  var _separator;
  var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  separator = (_separator = separator) !== null && _separator !== void 0 ? _separator : /\r?\n/;
  return rawText.split(separator).map(item => item.trim()).filter(item => !isEmpty(item));
}
export function findKeyNode(key, node) {
  var pair = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  if (node && node.hasOwnProperty(key) && (pair ? node[key] === pair : true)) {
    return node;
  } else if (typeof node === 'object') {
    for (var index in node) {
      var result = findKeyNode(key, node[index], pair);
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
  return upperFirst(camelCase(str));
}
export function titleCase(str) {
  str = str || "";
  return str.replace(/\b\w/g, char => char.toUpperCase());
}
export function objectStringify(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        objectStringify(obj[key]);
      } else {
        var _obj$key;
        if ((_obj$key = obj[key]) !== null && _obj$key !== void 0 && _obj$key.toString) {
          obj[key] = obj[key].toString();
        } else {
          obj[key] = String(obj[key]);
        }
      }
    }
  }
  return obj;
}
export function limitString(str) {
  var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 35;
  var omission = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "...";
  str = str || "";
  if (str.length <= limit) {
    return str;
  } else {
    return str.substring(0, limit - omission.length) + omission;
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
export function randomString(length) {
  var useNumbers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var useUppercase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var characters = CONSTANTS.LOWER_CASE;
  if (useUppercase) characters += CONSTANTS.UPPER_CASE;
  if (useNumbers) characters += CONSTANTS.NUMBERS;
  var randomString = '';
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
  }
  return randomString;
}
export function randomHex(length) {
  var result = '';
  for (var i = 0; i < length; i++) {
    var randomIndex = Math.floor(Math.random() * CONSTANTS.HEXADECIMAL.length);
    result += CONSTANTS.HEXADECIMAL[randomIndex];
  }
  return result;
}
export function randomInteger(min, max, callback) {
  var minNotSpecified = typeof max === 'undefined' || typeof max === 'function';
  if (minNotSpecified) {
    callback = max;
    max = min;
    min = 0;
  }
  var isSync = typeof callback === 'undefined';
  if (typeof min !== 'number' || typeof max !== 'number') {
    throw new Error('min and max must be numerical values');
  }
  if (max <= min) {
    throw new Error('max must be greater than min');
  }
  var randomNumber = Math.floor(Math.random() * (max - min)) + min;
  if (isSync) {
    return randomNumber;
  } else {
    if (typeof callback !== 'function') {
      throw new Error('callback must be a function');
    }
    callback(randomNumber);
  }
}
export function randomUuid() {
  var useDashes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var d = Date.now();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : r & 0x3 | 0x8).toString(16);
  });
  return useDashes ? uuid : uuid.replaceAll("-", "");
}
export function randomWeighted(dict) {
  var randomFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : totalWeight => Math.random() * totalWeight;
  var elements = Object.keys(dict);
  var weights = Object.values(dict);
  var totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  var randomNum = randomFunc(totalWeight);
  var weightSum = 0;
  for (var i = 0; i < elements.length; i++) {
    weightSum += weights[i];
    if (randomNum <= weightSum) {
      return elements[i];
    }
  }
}
export function cookieDict(res) {
  var decodeValues = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var dict = {};
  var cookies = setCookieParser.parse(res, {
    decodeValues: decodeValues
  });
  for (var cookie of cookies) {
    dict[cookie.name] = cookie.value;
  }
  return dict;
}
export function cookieHeader(cookieDict) {
  return Object.entries(cookieDict).map(_ref => {
    var [key, value] = _ref;
    return "".concat(key, "=").concat(value);
  }).join(';');
}
export function isIntlHttpCode(httpCode) {
  return httpCode === undefined || httpCode === null || isNaN(httpCode) || httpCode === 0 || httpCode === 100 || httpCode === 402 || httpCode === 407 || 460 <= httpCode && httpCode < 470 || 500 <= httpCode;
}
export function isIntlError(e) {
  var _e$message, _e$message$toLowerCas, _e$message$toLowerCas2, _e$message2, _e$message2$toLowerCa, _e$message2$toLowerCa2, _e$message3, _e$message3$toLowerCa, _e$message3$toLowerCa2, _e$message4, _e$message4$toLowerCa, _e$message4$toLowerCa2, _e$response;
  return (e === null || e === void 0 || (_e$message = e.message) === null || _e$message === void 0 || (_e$message$toLowerCas = _e$message.toLowerCase) === null || _e$message$toLowerCas === void 0 || (_e$message$toLowerCas = _e$message$toLowerCas.call(_e$message)) === null || _e$message$toLowerCas === void 0 || (_e$message$toLowerCas2 = _e$message$toLowerCas.includes) === null || _e$message$toLowerCas2 === void 0 ? void 0 : _e$message$toLowerCas2.call(_e$message$toLowerCas, "timeout")) || (e === null || e === void 0 || (_e$message2 = e.message) === null || _e$message2 === void 0 || (_e$message2$toLowerCa = _e$message2.toLowerCase) === null || _e$message2$toLowerCa === void 0 || (_e$message2$toLowerCa = _e$message2$toLowerCa.call(_e$message2)) === null || _e$message2$toLowerCa === void 0 || (_e$message2$toLowerCa2 = _e$message2$toLowerCa.includes) === null || _e$message2$toLowerCa2 === void 0 ? void 0 : _e$message2$toLowerCa2.call(_e$message2$toLowerCa, "aborted")) || (e === null || e === void 0 || (_e$message3 = e.message) === null || _e$message3 === void 0 || (_e$message3$toLowerCa = _e$message3.toLowerCase) === null || _e$message3$toLowerCa === void 0 || (_e$message3$toLowerCa = _e$message3$toLowerCa.call(_e$message3)) === null || _e$message3$toLowerCa === void 0 || (_e$message3$toLowerCa2 = _e$message3$toLowerCa.includes) === null || _e$message3$toLowerCa2 === void 0 ? void 0 : _e$message3$toLowerCa2.call(_e$message3$toLowerCa, "tls connection")) || (e === null || e === void 0 || (_e$message4 = e.message) === null || _e$message4 === void 0 || (_e$message4$toLowerCa = _e$message4.toLowerCase) === null || _e$message4$toLowerCa === void 0 || (_e$message4$toLowerCa = _e$message4$toLowerCa.call(_e$message4)) === null || _e$message4$toLowerCa === void 0 || (_e$message4$toLowerCa2 = _e$message4$toLowerCa.includes) === null || _e$message4$toLowerCa2 === void 0 ? void 0 : _e$message4$toLowerCa2.call(_e$message4$toLowerCa, "socket hang")) || isIntlHttpCode(e === null || e === void 0 || (_e$response = e.response) === null || _e$response === void 0 ? void 0 : _e$response.status);
}