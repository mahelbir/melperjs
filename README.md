# MELPERJS

Node.js module to use predefined common functions and utilities

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
    console.log(helper.Exception("something went wrong", {status: 500}, "axios error"));
    console.log(helper.time());
    await helper.sleepMs(1000);
    console.log(helper.time());
    await helper.sleep(1);
    console.log(helper.time());
    try {
        await helper.promiseTimeout(1000, helper.sleepMs(2000));
    } catch (e) {
        console.error(e.message);
    }
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
    console.log("str empty", helper.checkEmpty(""));
    console.log("1 empty", helper.checkEmpty(1));
    console.log("[] empty", helper.checkEmpty([]));
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
    const password = helper.hashBcrypt("plain");
    console.log(password)
    console.log("passwordHash", helper.verifyBcrypt("plain", password));
    const cookies = helper.cookieDict(await axios.get("https://google.com"));
    console.log(cookies);
    console.log(helper.cookieHeader(cookies));
    const proxy = nodeHelper.formatProxy("127.0.0.1:8080:id:pw-{SESSION}");
    console.log(proxy);
    console.log(nodeHelper.proxyObject(proxy));
    console.log(await nodeHelper.proxify({mode: 4, proxy}));
    console.log(nodeHelper.serverIp());
    console.log("HTTP CODE: 401 FOREIGN", helper.foreignHttpError(401));
    console.log("HTTP CODE: 407 FOREIGN (Failed Proxy Auth)", helper.foreignHttpError(407));
    nodeHelper.createNumDir("test");
    nodeHelper.createDir("test");
    console.log("VERSIONED BY .GIT",  "v" + nodeHelper.getVersion());
})();

/*
{
  name: 'AxiosError',
  message: 'something went wrong',
  response: { status: 500 }
}
1700529489
1700529490
1700529491
Promise timed out after 1000ms
{ x: 1, y: 2, c: { d: true } }
str empty true
1 empty false
[] empty true
First letter upper
first Letter Lower
This Must Be Title
LONG...
SAFE TEXT
15WY89Q4yAMCzPmNsU0ANGX2eiOz7Gfy
9eb93429
7e1fb299-251c-4a75-bb37-f7cc3a730121
strongProbability
STIhrofUYVAQ4anplyJW2T7GEwSJkuk7
6db791a1
0cbef42d-a277-4f66-8bcc-e4de337c2b56
strongProbability
8d777f385d3dfec8815d20f7496026dc
$2b$10$IsuTscKKHbcf6sBp7BrCOOcg6A8v32G9UxzdYN3Y6xyMaUynweYX2
passwordHash true
{
  '1P_JAR': '2023-11-21-01',
  AEC: 'Ackid1TlDwA2YJw3rzP5t3x5vBdxZt-4AzkhdwLahUVpj3vhdVHvPlw0VWM',
  NID: '511=tD21gyuziCvCgZSQZd5h_xDFOF6df8AhkFy0iXq9MwHG9K8J3FEkT7L0CACgjJhGDVQFoZG_Pwi2Wo8Kf7NnmvcNGVmk-lDhY768PI9sVSUmSHIYwpfsuVvG4NwNwk3iPNKmbqaC_H-YVGZhEJVn2c6YYUVxE0oEDtfuyPhGOXw'
}
1P_JAR=2023-11-21-01;AEC=Ackid1TlDwA2YJw3rzP5t3x5vBdxZt-4AzkhdwLahUVpj3vhdVHvPlw0VWM;NID=511=tD21gyuziCvCgZSQZd5h_xDFOF6df8AhkFy0iXq9MwHG9K8J3FEkT7L0CACgjJhGDVQFoZG_Pwi2Wo8Kf7NnmvcNGVmk-lDhY768PI9sVSUmSHIYwpfsuVvG4NwNwk3iPNKmbqaC_H-YVGZhEJVn2c6YYUVxE0oEDtfuyPhGOXw
http://id:pw-{SESSION}@127.0.0.1:8080
{
  protocol: 'http',
  host: '127.0.0.1',
  port: 8080,
  auth: { username: 'id', password: 'pw-{SESSION}' }
}
http://id:pw-527ef984@127.0.0.1:8080
127.0.0.1
HTTP CODE: 401 FOREIGN false
HTTP CODE: 407 FOREIGN (Failed Proxy Auth) true
VERSIONED BY .GIT v2310.15182
 */
```

## License

The MIT License (MIT). Please see [License File](LISENCE) for more information.