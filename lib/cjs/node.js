"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNumDir = createNumDir;
exports.formatProxy = formatProxy;
exports.getVersion = getVersion;
exports.hashBcrypt = hashBcrypt;
exports.md5 = md5;
exports.proxyObject = proxyObject;
exports.proxyValue = proxyValue;
exports.serverIp = serverIp;
exports.tokenHex = tokenHex;
exports.tokenString = tokenString;
exports.tokenUuid = tokenUuid;
exports.tokenWeighted = tokenWeighted;
exports.verifyBcrypt = verifyBcrypt;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _crypto = _interopRequireDefault(require("crypto"));
var _os = require("os");
var _child_process = require("child_process");
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _index = require("./index.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function tokenString(length, useNumbers = true, useUppercase = false) {
  const lowercaseChars = _index.CONSTANTS.LOWER_CASE;
  const uppercaseChars = _index.CONSTANTS.UPPER_CASE;
  const numbers = _index.CONSTANTS.NUMBERS;
  let characters = lowercaseChars;
  if (useUppercase) characters += uppercaseChars;
  if (useNumbers) characters += numbers;
  let randomString = '';
  while (randomString.length < length) {
    const byte = _crypto.default.randomBytes(1)[0];
    const index = byte % characters.length;
    if (byte < 256 - 256 % characters.length) {
      randomString += characters[index];
    }
  }
  return randomString;
}
function tokenHex(length) {
  return _crypto.default.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}
function tokenUuid(useDashes = true) {
  const uuid = _crypto.default.randomUUID().toString();
  return useDashes ? uuid : uuid.replaceAll("-", "");
}
function tokenWeighted(dict) {
  return (0, _index.randomWeighted)(dict, _crypto.default.randomInt);
}
function serverIp() {
  const interfaces = (0, _os.networkInterfaces)();
  for (const devName in interfaces) {
    const interfaceValue = interfaces[devName];
    for (let i = 0; i < interfaceValue.length; i++) {
      const alias = interfaceValue[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.address.startsWith("192.168.") && !alias.internal) return alias.address;
    }
  }
  return '127.0.0.1';
}
function getVersion() {
  try {
    const date = new Date((0, _child_process.execSync)('git show -s --format=%ci HEAD').toString().trim());
    const formatDatePart = value => value.toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const month = formatDatePart(date.getMonth() + 1);
    const day = formatDatePart(date.getDate());
    const hour = formatDatePart(date.getHours());
    const minute = formatDatePart(date.getMinutes());
    return parseFloat(`${year}${month}${day}.${hour}${minute}`);
  } catch {
    return 1.0;
  }
}
function createNumDir(mainDirectory) {
  _fs.default.mkdirSync(mainDirectory, {
    recursive: true
  });
  for (let i = 0; i <= 9; i++) {
    try {
      _fs.default.mkdirSync(_path.default.join(mainDirectory, i.toString()));
    } catch (e) {
      console.error(`createNumDir:${i}`, e.message);
    }
  }
}
function md5(data) {
  return _crypto.default.createHash('md5').update(data).digest("hex");
}
function hashBcrypt(plainText, encryptionKey = "") {
  return _bcryptjs.default.hashSync(plainText + encryptionKey, _bcryptjs.default.genSaltSync(10));
}
function verifyBcrypt(plainText, hash, encryptionKey = "") {
  return _bcryptjs.default.compareSync(plainText + encryptionKey, hash);
}
function formatProxy(proxy, protocol = "http") {
  proxy = proxy.trim();
  const splitByProtocol = proxy.split("://");
  if (1 < splitByProtocol.length) protocol = splitByProtocol[0];
  proxy = splitByProtocol[splitByProtocol.length - 1];
  if (!proxy.includes("@")) {
    const proxyParts = proxy.split(":");
    if (4 <= proxyParts.length) {
      proxy = `${proxyParts[proxyParts.length - 2]}:${proxyParts[proxyParts.length - 1]}@`;
      proxyParts.pop();
      proxyParts.pop();
      proxy += proxyParts.join(":");
    }
  }
  const proxyParts = proxy.split(':');
  const proxyEnd = parseInt(proxyParts[proxyParts.length - 1]);
  const proxyStart = proxyParts[proxyParts.length - 2];
  if (!proxyStart.includes(".")) {
    proxyParts.pop();
    proxyParts[proxyParts.length - 1] = _crypto.default.randomInt(parseInt(proxyStart), proxyEnd + 1).toString();
  }
  return protocol + "://" + proxyParts.join(':');
}
function proxyObject(...args) {
  let proxy = formatProxy(...args);
  const splitByProtocol = proxy.split('://');
  const splitById = splitByProtocol[splitByProtocol.length - 1].split('@');
  const splitByConn = splitById[splitById.length - 1].split(':');
  proxy = {
    protocol: splitByProtocol[0],
    host: splitByConn[0],
    port: parseInt(splitByConn[1])
  };
  if (1 < splitById.length) {
    const splitByAuth = splitById[0].split(':');
    proxy.auth = {
      username: splitByAuth[0],
      password: splitByAuth[1]
    };
  }
  return proxy;
}
function proxyValue(proxies) {
  let proxy;
  proxies = proxies || "";
  proxies = (0, _index.splitClear)(proxies);
  if (proxies.length < 1) return null;
  proxy = proxies[_crypto.default.randomInt(0, proxies.length)];
  proxy = formatProxy(proxy);
  proxy = proxy.replace("{SESSION}", tokenHex(8));
  return proxy || null;
}