import axios from "axios"
import * as helper from "../src/index.js";
import * as nodeHelper from "../src/node.js";


console.log(helper.CONSTANTS);
console.log(helper.time());
await helper.sleepMs(1000);
console.log(helper.time());
await helper.sleep(1);
console.log(helper.time());
try {
    await helper.promiseTimeout(1000, helper.sleepMs(2000));
} catch (e) {
    console.error(e.message);
    console.log("Timeout, Internal Error ?", helper.isIntlHttpError(e));
}
const errorPronePromise = helper.retryFn(async () => {
    console.log("Retry this function");
    throw new Error("error")
}, 5, (attempt, error, result) => {
    if (attempt % 2 === 0) {
        console.error("Even attempt error");
    }
});
helper.promiseSilent(errorPronePromise);
console.log("Is valid URL ?", helper.isValidURL("https://google.com"));
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
console.log(helper.titleCase("THIS mUsT be Title"));
console.log(helper.parseNumFromObj({
    a: "123",
    b: 456,
    c: "789.01",
    d: "hello",
    e: "0",
    f: true,
    g: "5000"
}));
console.log(helper.parseIntFromObj({
    a: "123",
    b: 456,
    c: "789.01",
    d: "hello",
    e: "0",
    f: true,
    g: "5000"
}))
console.log(helper.objectStringify({
    a: "hello",
    b: 1,
    c: undefined,
    d: null,
    e: {
        ea: 2
    },
    f: [3, 4, 5],
    g: false
}));
console.log(helper.modifyObjectKeys({"A": "B"}, (key) => key.toLowerCase()));
console.log(helper.limitString("LONG TEXT", 7));
console.log(helper.safeString("<strong>SAFE TEXT</strong>"));
console.log(helper.shuffleString("ABC123"));
console.log(helper.randomString(32, true, true));
console.log(helper.randomHex(8));
console.log(helper.randomInteger(100, 1000));
console.log(helper.randomUuid(true));
console.log(helper.randomWeighted({strongProbability: 1000, lowProbability: 1}));
console.log(helper.randomElement({a: "vA", b: "vB", c: "vC"}));
console.log(nodeHelper.tokenString(32, true, true));
console.log(nodeHelper.tokenHex(8));
console.log(nodeHelper.tokenUuid(true));
console.log(nodeHelper.tokenWeighted({strongProbability: 1000, lowProbability: 1}));
console.log(nodeHelper.tokenElement(["vA", "vB", "vC"]));
console.log(nodeHelper.hash("md5", "data"));
const password = nodeHelper.hashBcrypt("plain", "encryptionKey");
console.log(password)
console.log("passwordHash verified ?", nodeHelper.verifyBcrypt("plain", password, "encryptionKey"));
console.log(await nodeHelper.executeCommand("python --version"));
console.log(helper.indexByTime(5));
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
await nodeHelper.writeJsonFile("test.json", {test: "test json file"});
console.log(nodeHelper.readJsonFileSync("test.json"));
console.log("VERSIONED BY .GIT", "v" + nodeHelper.getVersion());
console.log(helper.Exception("something went wrong", {status: 400}, "bad request error"));
await helper.forever(1000, async () => {
        await helper.sleep(1);
        console.log("Do something!")
    }, (e) => {
        console.error("Error!", e);
        return 5000
    }, () => {
        console.log("Run this process forever!")
    }
);