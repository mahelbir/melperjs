import * as helper from "../src/index.js"
import * as nodeHelper from "../src/node.js"
import axios from "axios"


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