const helper = require("../src/index");
const axios = require("axios");


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