# MELPERJS

Nodejs module to use predefined common functions and utilities

## Installation

To install use npm:

```bash
npm i melperjs
```

## Usage

```javascript
const helper = require("melperjs");


(async () => {
    console.log("ENDSWITH TH", helper._.endsWith("ENDSWITH", "TH"));
    console.log(helper.exception("something went wrong"));
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
    console.log(helper.randomWeighted({strongProbability: 1000, lowProbability: 1}));
    console.log(helper.tokenHex(8));
    console.log(helper.md5("data"));
    const password = helper.hashBcrypt("plain");
    console.log(password)
    console.log("passwordHash", helper.verifyBcrypt("plain", password));
    const cookies = helper.cookieDict(await axios.get("https://google.com"));
    console.log(cookies);
    console.log(helper.cookieHeader(cookies));
    const proxy = helper.formatProxy("127.0.0.1:8080:id:pw-{SESSION}");
    console.log(proxy);
    console.log(helper.proxyObject(proxy));
    console.log(await helper.proxify({mode: 4, proxy}));
    console.log(helper.serverIP());
    console.log("HTTP CODE: 401 FOREIGN", helper.foreignError(401));
    console.log("HTTP CODE: 0 FOREIGN", helper.foreignError(0));
    helper.createNumDir("test");
    helper.createDir("test");
    console.log("VERSIONED BY .GIT",  "v" + helper.getVersion());
})();

/*
ENDSWITH TH true
{ message: 'something went wrong', response: { status: 400 } }
1697381865
1697381866
1697381867
Promise timed out after 1000ms
{ x: 1, y: 2, c: { d: true } }
1 empty false
[] empty true
LONG...
SAFE TEXT
strongProbability
16638f79
8d777f385d3dfec8815d20f7496026dc
$2b$10$TYGF7Pe8YkdZY.w8f4cUneUYDYvzKCEaXohUzCfz.JStoatMKa0Im
passwordHash true
{
  '1P_JAR': '2023-10-15-14',
  AEC: 'Ackid1QW89FoW9j6RUUZDe9RpJGJN9Flq0Qs0nnbt7AUHJBuDcf3FKulcg',
  NID: '511=RtEjqdKHa6MQ3Qaxr1Jh-8ktRCWPmSkV7iuo0P1MsLdhyuOyN7u1gXTAL8ojUO85rmcjUpfoul5Ucx7cBUzoLZzs5HpAnF5exxGiPvSUQeQHWADHgio7hmIl62kjHMKWJmmYtRcRFsKI9sgMUPr1MhX4Me181cqtNUgi8OLtCzY'
}
1P_JAR=2023-10-15-14;AEC=Ackid1QW89FoW9j6RUUZDe9RpJGJN9Flq0Qs0nnbt7AUHJBuDcf3FKulcg;NID=511=RtEjqdKHa6MQ3Qaxr1Jh-8ktRCWPmSkV7iuo0P1MsLdhyuOyN7u1gXTAL8ojUO85rmcjUpfoul5Ucx7cBUzoLZzs5HpAnF5exxGiPvSUQeQHWADHgio7hmIl62kjHMKWJmmYtRcRFsKI9sgMUPr1MhX4Me181cqtNUgi8OLtCzY
http://id:pw-{SESSION}@127.0.0.1:8080
{
  protocol: 'http',
  host: '127.0.0.1',
  port: 8080,
  auth: { username: 'id', password: 'pw-{SESSION}' }
}
http://id:pw-1708fa06@127.0.0.1:8080
192.168.1.2
HTTP CODE: 401 FOREIGN false
HTTP CODE: 0 FOREIGN true
fatal: not a git repository (or any of the parent directories): .git
VERSIONED BY .GIT v2310.151313
 */
```

## License

The MIT License (MIT). Please see [License File](LISENCE) for more information.