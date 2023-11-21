"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDir = createDir;
exports.createNumDir = createNumDir;
exports.formatProxy = formatProxy;
exports.getVersion = getVersion;
exports.md5 = md5;
exports.proxify = proxify;
exports.proxyObject = proxyObject;
exports.serverIp = serverIp;
exports.tokenHex = tokenHex;
exports.tokenString = tokenString;
exports.tokenUuid = tokenUuid;
exports.tokenWeighted = tokenWeighted;
var _fs = _interopRequireDefault(require("fs"));
var _path = _interopRequireDefault(require("path"));
var _crypto = _interopRequireDefault(require("crypto"));
var _os = require("os");
var _child_process = require("child_process");
var _axios = _interopRequireDefault(require("axios"));
var _hpagent = require("hpagent");
var _index = require("./index.js");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function tokenString(length, useNumbers = true, useUppercase = false) {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
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
    return parseFloat(`${year}${month}.${day}${hour}${minute}`);
  } catch {
    return 1.0;
  }
}
function createDir(directory) {
  if (!_fs.default.existsSync(directory)) {
    _fs.default.mkdirSync(directory, {
      recursive: true
    });
    return true;
  }
  return false;
}
function createNumDir(mainDirectory) {
  createDir(mainDirectory);
  for (let i = 0; i <= 9; i++) {
    try {
      createDir(_path.default.join(mainDirectory, i.toString()));
    } catch (e) {
      console.error(`createNumDir:${i}`, e.message);
    }
  }
}
function md5(data) {
  return _crypto.default.createHash('md5').update(data).digest("hex");
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
async function proxify(proxyConfig, callback = formatProxy) {
  proxyConfig = proxyConfig || {};
  const timeout = 7000;
  if (proxyConfig.mode === 1) {
    return callback(proxyConfig.proxy);
  } else if (proxyConfig.mode === 2) {
    const proxy = callback(proxyConfig.proxy);
    try {
      await _axios.default.get(proxyConfig.resetApi, {
        timeout
      });
    } catch {
      return false;
    }
    await (0, _index.sleep)(5);
    for (let i = 0; i < 5; i++) {
      try {
        const res = await _axios.default.get("https://api64.ipify.org", {
          timeout,
          httpsAgent: new _hpagent.HttpsProxyAgent({
            proxy,
            timeout: 7000
          })
        });
        if (res.status === 200) return proxy;
      } catch {
        await (0, _index.sleep)(3);
      }
    }
  } else if (proxyConfig.mode === 3) {
    try {
      const res = await _axios.default.get(proxyConfig.resetApi, {
        timeout
      });
      if (res.status === 200) return callback(proxyConfig.proxy);
    } catch {
      return false;
    }
  } else if (proxyConfig.mode === 4) {
    return callback(proxyConfig.proxy).replace("{SESSION}", tokenHex(8));
  } else if (proxyConfig.mode === 5) {
    try {
      const lines = proxyConfig.proxy.split("\n");
      const line = lines[_crypto.default.randomInt(0, lines.length)];
      return callback(line);
    } catch {
      return false;
    }
  }
  return null;
}