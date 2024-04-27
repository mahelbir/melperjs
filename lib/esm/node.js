import fs from "fs";
import path from "path";
import crypto from "crypto";
import { networkInterfaces } from "os";
import { execSync } from "child_process";
import bcrypt from "bcryptjs";
import { CONSTANTS, randomWeighted, splitClear } from "./index.js";
export function tokenString(length) {
  var useNumbers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
  var useUppercase = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
  var lowercaseChars = CONSTANTS.LOWER_CASE;
  var uppercaseChars = CONSTANTS.UPPER_CASE;
  var numbers = CONSTANTS.NUMBERS;
  var characters = lowercaseChars;
  if (useUppercase) characters += uppercaseChars;
  if (useNumbers) characters += numbers;
  var randomString = '';
  while (randomString.length < length) {
    var byte = crypto.randomBytes(1)[0];
    var index = byte % characters.length;
    if (byte < 256 - 256 % characters.length) {
      randomString += characters[index];
    }
  }
  return randomString;
}
export function tokenHex(length) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}
export function tokenUuid() {
  var useDashes = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
  var uuid = crypto.randomUUID().toString();
  return useDashes ? uuid : uuid.replaceAll("-", "");
}
export function tokenWeighted(dict) {
  return randomWeighted(dict, crypto.randomInt);
}
export function serverIp() {
  var interfaces = networkInterfaces();
  for (var devName in interfaces) {
    var interfaceValue = interfaces[devName];
    for (var i = 0; i < interfaceValue.length; i++) {
      var alias = interfaceValue[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.address.startsWith("192.168.") && !alias.internal) return alias.address;
    }
  }
  return '127.0.0.1';
}
export function getVersion() {
  try {
    var date = new Date(execSync('git show -s --format=%ci HEAD').toString().trim());
    var formatDatePart = value => value.toString().padStart(2, '0');
    var year = date.getFullYear().toString().slice(-2);
    var month = formatDatePart(date.getMonth() + 1);
    var day = formatDatePart(date.getDate());
    var hour = formatDatePart(date.getHours());
    var minute = formatDatePart(date.getMinutes());
    return parseFloat("".concat(year).concat(month).concat(day, ".").concat(hour).concat(minute));
  } catch (_unused) {
    return 1.0;
  }
}
export function createNumDir(mainDirectory) {
  fs.mkdirSync(mainDirectory, {
    recursive: true
  });
  for (var i = 0; i <= 9; i++) {
    try {
      fs.mkdirSync(path.join(mainDirectory, i.toString()));
    } catch (e) {
      console.error("createNumDir:".concat(i), e.message);
    }
  }
}
export function md5(data) {
  return crypto.createHash('md5').update(data).digest("hex");
}
export function hashBcrypt(plainText) {
  var encryptionKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
  return bcrypt.hashSync(plainText + encryptionKey, bcrypt.genSaltSync(10));
}
export function verifyBcrypt(plainText, hash) {
  var encryptionKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
  return bcrypt.compareSync(plainText + encryptionKey, hash);
}
export function formatProxy(proxy) {
  var protocol = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "http";
  proxy = proxy.trim();
  var splitByProtocol = proxy.split("://");
  if (1 < splitByProtocol.length) protocol = splitByProtocol[0];
  proxy = splitByProtocol[splitByProtocol.length - 1];
  if (!proxy.includes("@")) {
    var _proxyParts = proxy.split(":");
    if (4 <= _proxyParts.length) {
      proxy = "".concat(_proxyParts[_proxyParts.length - 2], ":").concat(_proxyParts[_proxyParts.length - 1], "@");
      _proxyParts.pop();
      _proxyParts.pop();
      proxy += _proxyParts.join(":");
    }
  }
  var proxyParts = proxy.split(':');
  var proxyEnd = parseInt(proxyParts[proxyParts.length - 1]);
  var proxyStart = proxyParts[proxyParts.length - 2];
  if (!proxyStart.includes(".")) {
    proxyParts.pop();
    proxyParts[proxyParts.length - 1] = crypto.randomInt(parseInt(proxyStart), proxyEnd + 1).toString();
  }
  return protocol + "://" + proxyParts.join(':');
}
export function proxyObject() {
  var proxy = formatProxy(...arguments);
  var splitByProtocol = proxy.split('://');
  var splitById = splitByProtocol[splitByProtocol.length - 1].split('@');
  var splitByConn = splitById[splitById.length - 1].split(':');
  proxy = {
    protocol: splitByProtocol[0],
    host: splitByConn[0],
    port: parseInt(splitByConn[1])
  };
  if (1 < splitById.length) {
    var splitByAuth = splitById[0].split(':');
    proxy.auth = {
      username: splitByAuth[0],
      password: splitByAuth[1]
    };
  }
  return proxy;
}
export function proxyValue(proxies) {
  var proxy;
  proxies = proxies || "";
  proxies = splitClear(proxies);
  if (proxies.length < 1) return null;
  proxy = proxies[crypto.randomInt(0, proxies.length)];
  proxy = formatProxy(proxy);
  proxy = proxy.replace("{SESSION}", tokenHex(8));
  return proxy || null;
}