"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cleanDirectory = cleanDirectory;
exports.createNumDir = createNumDir;
exports.executeCommand = executeCommand;
exports.formatProxy = formatProxy;
exports.getVersion = getVersion;
exports.hash = hash;
exports.hashBcrypt = hashBcrypt;
exports.md5 = md5;
exports.proxyObject = proxyObject;
exports.proxyValue = proxyValue;
exports.readJsonFile = readJsonFile;
exports.readJsonFileSync = readJsonFileSync;
exports.serverIp = serverIp;
exports.sha256 = sha256;
exports.tokenElement = tokenElement;
exports.tokenHex = tokenHex;
exports.tokenInteger = tokenInteger;
exports.tokenString = tokenString;
exports.tokenUuid = tokenUuid;
exports.tokenWeighted = tokenWeighted;
exports.verifyBcrypt = verifyBcrypt;
exports.writeJsonFile = writeJsonFile;
exports.writeJsonFileSync = writeJsonFileSync;
var _fs = _interopRequireWildcard(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _crypto = _interopRequireDefault(require("crypto"));
var _os = require("os");
var _child_process = require("child_process");
var _bcryptjs = _interopRequireDefault(require("bcryptjs"));
var _index = require("./index.js");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
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
function tokenInteger(min, max) {
  return _crypto.default.randomInt(min, max);
}
function tokenUuid(useDashes = true) {
  const uuid = _crypto.default.randomUUID().toString();
  return useDashes ? uuid : uuid.replaceAll("-", "");
}
function tokenWeighted(dict) {
  return (0, _index.randomWeighted)(dict, _crypto.default.randomInt);
}
function tokenElement(obj) {
  if (Array.isArray(obj)) {
    return obj[_crypto.default.randomInt(0, obj.length)];
  } else {
    return obj[tokenElement(Object.keys(obj))];
  }
}
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    (0, _child_process.exec)(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout.trim());
      }
    });
  });
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
    const timestamp = parseInt((0, _child_process.execSync)('git show -s --format=%ct HEAD').toString().trim());
    if (isNaN(timestamp)) {
      return "1.0";
    }
    const date = new Date(timestamp * 1000);
    const formatDatePart = value => value.toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString().slice(-2);
    const month = formatDatePart(date.getUTCMonth() + 1);
    const day = formatDatePart(date.getUTCDate());
    const hour = formatDatePart(date.getUTCHours());
    const minute = formatDatePart(date.getUTCMinutes());
    return `${year}${month}${day}.${hour}${minute}`;
  } catch {
    return "1.0";
  }
}
function createNumDir(mainDirectory, start = 0, end = 9) {
  _fs.default.mkdirSync(mainDirectory, {
    recursive: true
  });
  for (let i = start; i <= end; i++) {
    try {
      _fs.default.mkdirSync(_path.default.join(mainDirectory, i.toString()), {
        recursive: true
      });
    } catch (e) {
      console.error(`createNumDir:${i}`, e.message);
    }
  }
}
function hash(algorithm, data) {
  return _crypto.default.createHash(algorithm).update(data).digest("hex");
}
function md5(data) {
  return hash("md5", data);
}
function sha256(data) {
  return hash("sha256", data);
}
function hashBcrypt(plainText, encryptionKey = "", rounds = 12) {
  return _bcryptjs.default.hashSync(plainText + encryptionKey, _bcryptjs.default.genSaltSync(rounds));
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
async function readJsonFile(filePath, defaultValue = {}) {
  try {
    const data = await _fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}
function readJsonFileSync(filePath, defaultValue = {}) {
  try {
    const data = _fs.default.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return defaultValue;
  }
}
async function writeJsonFile(filePath, data) {
  const jsonData = JSON.stringify(data);
  return await _fs.promises.writeFile(filePath, jsonData, 'utf8');
}
function writeJsonFileSync(filePath, data) {
  const jsonData = JSON.stringify(data);
  return _fs.default.writeFileSync(filePath, jsonData, 'utf8');
}
async function cleanDirectory(directoryPath, keepDir = true) {
  try {
    const stats = await _fs.promises.stat(directoryPath).catch(() => null);
    if (!stats) {
      if (keepDir) {
        await _fs.promises.mkdir(directoryPath, {
          recursive: true
        });
      }
      return;
    }
    const files = await _fs.promises.readdir(directoryPath);
    for (const file of files) {
      const filePath = _path.default.join(directoryPath, file);
      const fileStat = await _fs.promises.stat(filePath);
      if (fileStat.isDirectory()) {
        await cleanDirectory(filePath, false);
      } else {
        await _fs.promises.unlink(filePath);
      }
    }
    if (!keepDir) {
      await _fs.promises.rmdir(directoryPath);
    }
    return true;
  } catch (error) {
    throw error;
  }
}