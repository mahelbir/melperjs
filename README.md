# MELPERJS

Javascript module to use predefined common functions and utilities

## Installation

To install use npm:

```bash
npm i melperjs
```

## Usage

```javascript
// import * as helper from "melperjs";
// import * as nodeHelper from "melperjs/node";
// import axios from "axios";
const helper = require("melperjs");
const nodeHelper = require("melperjs/node");
const axios = require("axios");

(async () => {
    console.log(helper.CONSTANTS);
    console.log(helper.Exception("something went wrong", {status: 400}, "bad request error"));
    console.log(helper.time());
    await helper.sleepMs(1000);
    console.log(helper.time());
    await helper.sleep(1);
    console.log(helper.time());
    try {
        await helper.promiseTimeout(1000, helper.sleepMs(2000));
    } catch (e) {
        console.error(e.message);
        console.log("Timeout, Internal Error ?", helper.isIntlError(e));
    }
    console.log(helper.splitLines(`
    2.satır
    
    4.satır
    `))
    console.log(helper.findKeyNode("c", {
        a: {
            b: {
                x: 1,
                y: 2,
                c: {
                    d: true
                }
            }
        }
    }));
    console.log("'' empty ?", helper.checkEmpty(''));
    console.log("1 empty ?", helper.checkEmpty(1));
    console.log("0 empty ?", helper.checkEmpty(1));
    console.log("[] empty ?", helper.checkEmpty([]));
    console.log(helper.pascalCase("pascal case"));
    console.log(helper.upperCaseFirst("first letter upper"));
    console.log(helper.lowerCaseFirst("First Letter Lower"));
    console.log(helper.titleString("THIS mUsT be Title"));
    console.log(helper.limitString("LONG TEXT", 7));
    console.log(helper.safeString("<strong>SAFE TEXT</strong>"));
    console.log(helper.randomString(32, true, true));
    console.log(helper.randomHex(8));
    console.log(helper.randomUuid(true));
    console.log(helper.randomWeighted({strongProbability: 1000, lowProbability: 1}));
    console.log(nodeHelper.tokenString(32, true, true));
    console.log(nodeHelper.tokenHex(8));
    console.log(nodeHelper.tokenUuid(true));
    console.log(nodeHelper.tokenWeighted({strongProbability: 1000, lowProbability: 1}));
    console.log(nodeHelper.md5("data"));
    const password = nodeHelper.hashBcrypt("plain");
    console.log(password)
    console.log("passwordHash verified ?", nodeHelper.verifyBcrypt("plain", password));
    const cookies = helper.cookieDict(await axios.get("https://google.com"));
    console.log(cookies);
    console.log(helper.cookieHeader(cookies));
    const proxy = nodeHelper.formatProxy("127.0.0.1:8080:id:pw-{SESSION}");
    console.log(proxy);
    console.log(nodeHelper.proxyObject(proxy));
    console.log(await nodeHelper.proxify({mode: 4, proxy}));
    console.log(nodeHelper.serverIp());
    console.log("HTTP CODE: 400 (Bad Request) ?", helper.isIntlHttpCode(401));
    console.log("HTTP CODE: 407 (Failed Proxy Auth) ?", helper.isIntlHttpCode(407));
    nodeHelper.createNumDir("test");
    console.log("VERSIONED BY .GIT",  "v" + nodeHelper.getVersion());
})();

/*
{
  LOWER_CASE: 'abcdefghijklmnopqrstuvwxyz',
  UPPER_CASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  HEXADECIMAL: '0123456789abcdef',
  NUMBERS: '0123456789'
}
{
  name: 'BadRequestError',
  message: 'something went wrong',
  response: { status: 400 }
}
1701697141
1701697142
1701697143
Promise timed out after 1000ms
Timeout, Internal Error ? true
[ '2.satır', '4.satır' ]
{ x: 1, y: 2, c: { d: true } }
'' empty ? true
1 empty ? false
0 empty ? false
[] empty ? true
PascalCase
First letter upper
first Letter Lower
This Must Be Title
LONG...
SAFE TEXT
sP3jTNwe1rRrW1TVAPb4HAXNFjJB2mWb
f70f7212
f07fe6b1-46d5-4f30-8138-f263f4916e65
strongProbability
JT4tXSI7YdIYDGbzLmHkItZ32vgi5aos
52c0da20
3e4374f4-11d9-4174-b337-dbf8d7fa2d41
strongProbability
8d777f385d3dfec8815d20f7496026dc
$2b$10$DTITmEyk1IcWfG1qaVEvyOgLReqOI97X/LufbbV/nvOU8DspBNMOS
passwordHash verified ? true
{
  '1P_JAR': '2023-12-04-13',
  AEC: 'Ackid1Q9P_jk5EM2S_PU_QT-RUEu0syeyPMuCOLYbtlkX5gvB1zRTPytuw',
  NID: '511=jBXxJSukq7Ku4449skx8tmFlqkM-nKwhaQ4hukE0F-jntKrI8daHyoAS6npvlujAMKU966ZMNGE6wu8xYc2PciilTQrKxgRyJv1QsdNIc6y_mlrLfuOfLXkwDuf0YWdS0Or3Aq6wHR87o0paAAcYAntlopexVF7NpQ6yifGe57c'
}
1P_JAR=2023-12-04-13;AEC=Ackid1Q9P_jk5EM2S_PU_QT-RUEu0syeyPMuCOLYbtlkX5gvB1zRTPytuw;NID=511=jBXxJSukq7Ku4449skx8tmFlqkM-nKwhaQ4hukE0F-jntKrI8daHyoAS6npvlujAMKU966ZMNGE6wu8xYc2PciilTQrKxgRyJv1QsdNIc6y_mlrLfuOfLXkwDuf0YWdS0Or3Aq6wHR87o0paAAcYAntlopexVF7NpQ6yifGe57c
http://id:pw-{SESSION}@127.0.0.1:8080
{
  protocol: 'http',
  host: '127.0.0.1',
  port: 8080,
  auth: { username: 'id', password: 'pw-{SESSION}' }
}
http://id:pw-749756be@127.0.0.1:8080
127.0.0.1
HTTP CODE: 400 (Bad Request) ? false
HTTP CODE: 407 (Failed Proxy Auth) ? true
VERSIONED BY .GIT v2310.15182
 */
```

## License

The MIT License (MIT). Please see [License File](LISENCE) for more information.