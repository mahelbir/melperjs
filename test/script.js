import axios from "axios"
import * as helper from "../src/index.js";
import * as nodeHelper from "../src/node.js";


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
    console.log(helper.splitClear(`
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
    console.log(helper.titleCase("THIS mUsT be Title"));
    console.log(helper.limitString("LONG TEXT", 7));
    console.log(helper.safeString("<strong>SAFE TEXT</strong>"));
    console.log(helper.randomString(32, true, true));
    console.log(helper.randomHex(8));
    console.log(helper.randomInteger(100, 1000));
    console.log(helper.randomUuid(true));
    console.log(helper.randomWeighted({strongProbability: 1000, lowProbability: 1}));
    console.log(nodeHelper.tokenString(32, true, true));
    console.log(nodeHelper.tokenHex(8));
    console.log(nodeHelper.tokenUuid(true));
    console.log(nodeHelper.tokenWeighted({strongProbability: 1000, lowProbability: 1}));
    console.log(nodeHelper.md5("data"));
    const password = nodeHelper.hashBcrypt("plain", "encryptionKey");
    console.log(password)
    console.log("passwordHash verified ?", nodeHelper.verifyBcrypt("plain", password, "encryptionKey"));
    const cookies = helper.cookieDict(await axios.get("https://google.com"));
    console.log(cookies);
    console.log(helper.cookieHeader(cookies));
    const proxy = nodeHelper.formatProxy("127.0.0.1:8080:id:pw-{SESSION}");
    console.log(proxy);
    console.log(nodeHelper.proxyObject(proxy));
    console.log(nodeHelper.proxyValue(proxy));
    console.log(nodeHelper.serverIp());
    console.log("HTTP CODE: 400 (Bad Request) ?", helper.isIntlHttpCode(401));
    console.log("HTTP CODE: 407 (Failed Proxy Auth) ?", helper.isIntlHttpCode(407));
    nodeHelper.createNumDir("test");
    console.log("VERSIONED BY .GIT",  "v" + nodeHelper.getVersion());
})();