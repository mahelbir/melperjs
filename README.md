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
    console.log(helper.Exception("something went wrong"));
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
    console.log("1 empty", helper.isEmpty(1));
    console.log("[] empty", helper.isEmpty([]));
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
{ message: 'something went wrong', response: { status: 400 } }
1700522762
1700522763
1700522764
Promise timed out after 1000ms
{ x: 1, y: 2, c: { d: true } }
1 empty false
[] empty true
LONG...
SAFE TEXT
i9ULmdbboTDL7NPgJRiY1i6O1x0D71wG
91d59653
50fe22be-a4e9-46cd-b73b-da5669ca43b4
strongProbability
kpG7GBnGf8kK2JGwSNe8EaIdkrKl5OEr
4f592b6e
e7947cc3-d975-446c-82ec-fc77d84a67bb
strongProbability
8d777f385d3dfec8815d20f7496026dc
$2b$10$m3gbDZMz6P/NKtOBtcJPTe5Dt9TtGaFVE5M.F07QR4bLHoKuezfpm
passwordHash true
{
  '1P_JAR': '2023-11-20-23',
  AEC: 'Ackid1QUUwFH8ZlfrHR1RFoG3nbxsOvmYckU_mnIw4Z6cE4ue9_mbng2mmU',
  NID: '511=m55MFOJ7XlxlkanJtm0q7eK5PkaePFQiaxEeMcAR_ojuPBWZ0bqw6tbDq4VGuT2CrTNgGWw_lLECx100Qlm1bRBNYEx_0wWtVNCh582q9-zhvQFSDbAI3vDtl-vMlMbpv_6JYJ7YBhGf1S6zbqv6Q84hlbLBOIg8Dt633-b5b94'
}
1P_JAR=2023-11-20-23;AEC=Ackid1QUUwFH8ZlfrHR1RFoG3nbxsOvmYckU_mnIw4Z6cE4ue9_mbng2mmU;NID=511=m55MFOJ7XlxlkanJtm0q7eK5PkaePFQiaxEeMcAR_ojuPBWZ0bqw6tbDq4VGuT2CrTNgGWw_lLECx100Qlm1bRBNYEx_0wWtVNCh582q9-zhvQFSDbAI3vDtl-vMlMbpv_6JYJ7YBhGf1S6zbqv6Q84hlbLBOIg8Dt633-b5b94
http://id:pw-{SESSION}@127.0.0.1:8080
{
  protocol: 'http',
  host: '127.0.0.1',
  port: 8080,
  auth: { username: 'id', password: 'pw-{SESSION}' }
}
http://id:pw-06cbcd75@127.0.0.1:8080
127.0.0.1
HTTP CODE: 401 FOREIGN false
HTTP CODE: 407 FOREIGN (Failed Proxy Auth) true
VERSIONED BY .GIT v2310.15182
 */
```

## License

The MIT License (MIT). Please see [License File](LISENCE) for more information.