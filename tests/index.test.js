import {describe, it} from "node:test";
import assert from "node:assert/strict";

import {
    CONSTANTS,
    Exception,
    forever,
    time,
    sleepMs,
    sleep,
    promiseTimeout,
    promiseSilent,
    retryFn,
    isValidURL,
    splitClear,
    checkEmpty,
    pascalCase,
    titleCase,
    isInt32,
    parseNumFromObj,
    parseIntFromObj,
    findKeyNode,
    waitForProperty,
    flipObject,
    shuffleObject,
    objectStringify,
    modifyObjectKeys,
    limitString,
    safeString,
    shuffleString,
    randomString,
    randomHex,
    randomInteger,
    randomUuid,
    randomWeighted,
    randomElement,
    indexByTime,
    cookieDict,
    cookieHeader,
    cookieStringToObject,
    isIntlHttpCode,
    isIntlHttpError,
    getResponseError
} from "../src/index.js";


describe("CONSTANTS", () => {
    it("exposes the expected character sets and int32 limits", () => {
        assert.equal(CONSTANTS.LOWER_CASE, "abcdefghijklmnopqrstuvwxyz");
        assert.equal(CONSTANTS.UPPER_CASE, "ABCDEFGHIJKLMNOPQRSTUVWXYZ");
        assert.equal(CONSTANTS.HEXADECIMAL, "0123456789abcdef");
        assert.equal(CONSTANTS.NUMBERS, "0123456789");
        assert.equal(CONSTANTS.INT32_MIN, -2147483648);
        assert.equal(CONSTANTS.INT32_MAX, 2147483647);
    });
});


describe("Exception", () => {
    it("returns an Error with default name and status", () => {
        const err = Exception("boom");
        assert.ok(err instanceof Error);
        assert.equal(err.message, "boom");
        assert.equal(err.name, "Exception");
        assert.deepEqual(err.response, {status: 400});
    });

    it("honors custom name and response", () => {
        const err = Exception("nope", {status: 404, data: "x"}, "NotFound");
        assert.equal(err.name, "NotFound");
        assert.equal(err.response.status, 404);
        assert.equal(err.response.data, "x");
    });

    it("resets empty response and adds default status", () => {
        const err = Exception("e", {});
        assert.deepEqual(err.response, {status: 400});
    });
});


describe("forever", () => {
    it("rejects when cooldown is not positive", async () => {
        await assert.rejects(forever(0, async () => {}), /positive number/);
        await assert.rejects(forever(-1, async () => {}), /positive number/);
        await assert.rejects(forever(null, async () => {}), /positive number/);
    });
});


describe("time / sleep / sleepMs", () => {
    it("time() returns integer seconds close to Date.now()/1000", () => {
        const t = time();
        assert.ok(Number.isInteger(t));
        assert.ok(Math.abs(t - Math.floor(Date.now() / 1000)) <= 1);
    });

    it("sleepMs waits roughly the requested duration", async () => {
        const start = Date.now();
        await sleepMs(50);
        assert.ok(Date.now() - start >= 45);
    });

    it("sleep(seconds) delegates to sleepMs", async () => {
        const start = Date.now();
        await sleep(0.05);
        assert.ok(Date.now() - start >= 45);
    });
});


describe("promiseTimeout / promiseSilent", () => {
    it("resolves when the inner promise wins the race", async () => {
        const value = await promiseTimeout(200, Promise.resolve(42));
        assert.equal(value, 42);
    });

    it("rejects when the timeout wins", async () => {
        await assert.rejects(promiseTimeout(50, sleepMs(500)), /timed out/);
    });

    it("promiseSilent swallows rejections", async () => {
        await promiseSilent(Promise.reject(new Error("ignored")));
    });
});


describe("retryFn", () => {
    it("returns the first successful result", async () => {
        let calls = 0;
        const result = await retryFn(async () => {
            calls++;
            if (calls < 2) throw new Error("fail");
            return "ok";
        }, 5);
        assert.equal(result, "ok");
        assert.equal(calls, 2);
    });

    it("invokes errorFn on each failure and rethrows after retries are exhausted", async () => {
        const errors = [];
        await assert.rejects(
            retryFn(
                async () => {throw new Error("nope");},
                3,
                (attempt, error) => errors.push([attempt, error.message])
            ),
            /nope/
        );
        assert.equal(errors.length, 3);
        assert.deepEqual(errors[0], [1, "nope"]);
    });
});


describe("isValidURL", () => {
    it("returns true for valid URLs", () => {
        assert.equal(isValidURL("https://example.com"), true);
        assert.equal(isValidURL("http://localhost:3000/path?x=1"), true);
    });

    it("returns false for invalid URLs", () => {
        assert.equal(isValidURL("not a url"), false);
        assert.equal(isValidURL(""), false);
    });
});


describe("splitClear", () => {
    it("splits on newlines and trims/filters empty lines by default", () => {
        const result = splitClear("\n  a  \n\n  b  \n");
        assert.deepEqual(result, ["a", "b"]);
    });

    it("accepts a custom separator", () => {
        assert.deepEqual(splitClear("a, b,  ,c", ","), ["a", "b", "c"]);
    });
});


describe("checkEmpty", () => {
    it("treats numeric zero as empty", () => {
        assert.equal(checkEmpty(0), true);
        assert.equal(checkEmpty(1), false);
    });

    it("delegates to lodash.isEmpty for non-numbers", () => {
        assert.equal(checkEmpty(""), true);
        assert.equal(checkEmpty([]), true);
        assert.equal(checkEmpty({}), true);
        assert.equal(checkEmpty("x"), false);
        assert.equal(checkEmpty([1]), false);
    });
});


describe("pascalCase / titleCase", () => {
    it("pascalCase joins and uppercases the first letter", () => {
        assert.equal(pascalCase("hello world"), "HelloWorld");
        assert.equal(pascalCase("foo_bar-baz"), "FooBarBaz");
    });

    it("titleCase upper-cases each word with the given separator", () => {
        assert.equal(titleCase("hello world"), "Hello World");
        assert.equal(titleCase("a-b-c", "-"), "A-B-C");
    });
});


describe("isInt32", () => {
    it("validates the int32 range", () => {
        assert.equal(isInt32(0), true);
        assert.equal(isInt32(CONSTANTS.INT32_MAX), true);
        assert.equal(isInt32(CONSTANTS.INT32_MIN), true);
        assert.equal(isInt32(CONSTANTS.INT32_MAX + 1), false);
        assert.equal(isInt32(1.5), false);
        assert.equal(isInt32("5"), false);
    });
});


describe("parseNumFromObj / parseIntFromObj", () => {
    it("parseNumFromObj converts numeric strings to numbers in place", () => {
        const obj = {a: "1.5", b: "2", c: "x", d: "1_000", e: 3};
        const result = parseNumFromObj(obj);
        assert.strictEqual(result, obj);
        assert.equal(obj.a, 1.5);
        assert.equal(obj.b, 2);
        assert.equal(obj.c, "x");
        assert.equal(obj.d, "1_000");
        assert.equal(obj.e, 3);
    });

    it("parseIntFromObj only converts exact integer strings", () => {
        const obj = {a: "5", b: "1.5", c: "x"};
        parseIntFromObj(obj);
        assert.equal(obj.a, 5);
        assert.equal(obj.b, "1.5");
        assert.equal(obj.c, "x");
    });
});


describe("findKeyNode", () => {
    it("returns the nearest node containing the given key", () => {
        const tree = {a: {b: {c: 1, target: "x"}}};
        assert.deepEqual(findKeyNode("target", tree), {c: 1, target: "x"});
    });

    it("matches by key/value pair when provided", () => {
        const tree = {a: {flag: false}, b: {flag: true}};
        assert.deepEqual(findKeyNode("flag", tree, true), {flag: true});
    });

    it("returns null when nothing matches", () => {
        assert.equal(findKeyNode("missing", {a: 1}), null);
    });
});


describe("waitForProperty", () => {
    it("resolves once the property appears", async () => {
        const obj = {};
        setTimeout(() => {obj.done = true;}, 30);
        await waitForProperty(obj, "done", 500, 10);
    });

    it("rejects on timeout", async () => {
        await assert.rejects(waitForProperty({}, "never", 50, 10), /did not appear/);
    });
});


describe("flipObject / shuffleObject", () => {
    it("flipObject swaps keys and values", () => {
        assert.deepEqual(flipObject({a: 1, b: 2}), {1: "a", 2: "b"});
    });

    it("shuffleObject preserves keys and values", () => {
        const input = {a: 1, b: 2, c: 3, d: 4};
        const shuffled = shuffleObject(input);
        assert.deepEqual(Object.keys(shuffled).sort(), ["a", "b", "c", "d"]);
        assert.deepEqual(Object.values(shuffled).sort(), [1, 2, 3, 4]);
    });
});


describe("objectStringify", () => {
    it("recursively converts every leaf to string and mutates the input", () => {
        const obj = {a: 1, b: {c: true, d: null}};
        const result = objectStringify(obj);
        assert.strictEqual(result, obj);
        assert.equal(obj.a, "1");
        assert.equal(obj.b.c, "true");
        assert.equal(obj.b.d, "null");
    });
});


describe("modifyObjectKeys", () => {
    it("applies the transform to each top-level key", () => {
        const input = {hello_world: 1, foo_bar: 2};
        const result = modifyObjectKeys(input, pascalCase);
        assert.deepEqual(result, {HelloWorld: 1, FooBar: 2});
    });
});


describe("limitString", () => {
    it("returns the string untouched when below the limit", () => {
        assert.equal(limitString("short", 10), "short");
    });

    it("truncates and appends the omission marker", () => {
        assert.equal(limitString("abcdefghijk", 8), "abcde...");
        assert.equal(limitString("abcdefghijk", 8, "!"), "abcdefg!");
    });
});


describe("safeString", () => {
    it("strips dangerous tags and keeps plain text", () => {
        const sanitized = safeString("<b>hello</b><script>alert(1)</script>");
        assert.ok(!sanitized.includes("<script"));
        assert.ok(sanitized.includes("hello"));
    });
});


describe("shuffleString", () => {
    it("returns a string of the same length with the same characters", () => {
        const input = "abcdef";
        const shuffled = shuffleString(input);
        assert.equal(shuffled.length, input.length);
        assert.deepEqual(shuffled.split("").sort(), input.split("").sort());
    });
});


describe("randomString / randomHex", () => {
    it("randomString respects the requested length and default charset", () => {
        const s = randomString(20);
        assert.equal(s.length, 20);
        assert.match(s, /^[a-z0-9]+$/);
    });

    it("randomString omits numbers when useNumbers=false", () => {
        const s = randomString(30, false);
        assert.match(s, /^[a-z]+$/);
    });

    it("randomString includes uppercase when requested", () => {
        let hasUpper = false;
        for (let i = 0; i < 30 && !hasUpper; i++) {
            if (/[A-Z]/.test(randomString(50, true, true))) hasUpper = true;
        }
        assert.ok(hasUpper);
    });

    it("randomHex returns only hex characters of the requested length", () => {
        const h = randomHex(16);
        assert.equal(h.length, 16);
        assert.match(h, /^[0-9a-f]+$/);
    });
});


describe("randomInteger", () => {
    it("returns a number in [min, max) when called synchronously", () => {
        for (let i = 0; i < 100; i++) {
            const n = randomInteger(5, 10);
            assert.ok(n >= 5 && n < 10);
            assert.ok(Number.isInteger(n));
        }
    });

    it("treats a single argument as max with min=0", () => {
        for (let i = 0; i < 50; i++) {
            const n = randomInteger(5);
            assert.ok(n >= 0 && n < 5);
        }
    });

    it("invokes the callback when given one", () => {
        let received;
        randomInteger(1, 3, (n) => {received = n;});
        assert.ok(received >= 1 && received < 3);
    });

    it("throws on invalid input", () => {
        assert.throws(() => randomInteger("a", 10), /numerical/);
        assert.throws(() => randomInteger(5, 5), /greater than min/);
    });
});


describe("randomUuid", () => {
    it("returns a v4-ish UUID with dashes by default", () => {
        const id = randomUuid();
        assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it("removes dashes when useDashes=false", () => {
        const id = randomUuid(false);
        assert.equal(id.length, 32);
        assert.match(id, /^[0-9a-f]{32}$/);
    });
});


describe("randomWeighted", () => {
    it("returns one of the dictionary keys", () => {
        const dict = {a: 1, b: 1, c: 1};
        for (let i = 0; i < 50; i++) {
            assert.ok(["a", "b", "c"].includes(randomWeighted(dict)));
        }
    });

    it("uses the provided random function deterministically", () => {
        const dict = {a: 1, b: 2, c: 1};
        assert.equal(randomWeighted(dict, () => 0.5), "a");
        assert.equal(randomWeighted(dict, () => 2.5), "b");
        assert.equal(randomWeighted(dict, () => 3.5), "c");
    });
});


describe("randomElement", () => {
    it("returns an array element", () => {
        const arr = [10, 20, 30];
        for (let i = 0; i < 20; i++) {
            assert.ok(arr.includes(randomElement(arr)));
        }
    });

    it("returns a value when given an object", () => {
        const obj = {a: 1, b: 2, c: 3};
        for (let i = 0; i < 20; i++) {
            assert.ok([1, 2, 3].includes(randomElement(obj)));
        }
    });
});


describe("indexByTime", () => {
    it("returns an integer in [0, 9]", () => {
        const result = indexByTime(0);
        assert.ok(Number.isInteger(result));
        assert.ok(result >= 0 && result <= 9);
    });
});


describe("cookieDict / cookieHeader / cookieStringToObject", () => {
    it("cookieDict parses set-cookie headers into a flat name/value map", () => {
        const res = {headers: {"set-cookie": ["a=1; Path=/", "b=2; Path=/"]}};
        assert.deepEqual(cookieDict(res), {a: "1", b: "2"});
    });

    it("cookieHeader serializes a map into a cookie header string", () => {
        assert.equal(cookieHeader({a: "1", b: "2"}), "a=1;b=2");
    });

    it("cookieStringToObject parses a cookie header into an object", () => {
        assert.deepEqual(cookieStringToObject("a=1; b=2; c="), {a: "1", b: "2", c: ""});
    });

    it("cookieStringToObject returns an empty object for empty input", () => {
        assert.deepEqual(cookieStringToObject(""), {});
        assert.deepEqual(cookieStringToObject(null), {});
    });

    it("cookieStringToObject keeps '=' inside values", () => {
        assert.deepEqual(cookieStringToObject("token=a=b=c"), {token: "a=b=c"});
    });
});


describe("isIntlHttpCode", () => {
    it("flags missing or transient codes", () => {
        assert.equal(isIntlHttpCode(undefined), true);
        assert.equal(isIntlHttpCode(null), true);
        assert.equal(isIntlHttpCode(0), true);
        assert.equal(isIntlHttpCode(100), true);
        assert.equal(isIntlHttpCode(402), true);
        assert.equal(isIntlHttpCode(407), true);
        assert.equal(isIntlHttpCode(417), true);
        assert.equal(isIntlHttpCode(460), true);
        assert.equal(isIntlHttpCode(469), true);
        assert.equal(isIntlHttpCode(500), true);
        assert.equal(isIntlHttpCode(503), true);
    });

    it("treats normal 2xx/3xx/4xx codes as not transient", () => {
        assert.equal(isIntlHttpCode(200), false);
        assert.equal(isIntlHttpCode(301), false);
        assert.equal(isIntlHttpCode(404), false);
        assert.equal(isIntlHttpCode(470), false);
    });
});


describe("isIntlHttpError", () => {
    it("matches known transient error messages", () => {
        assert.equal(isIntlHttpError(new Error("Timeout exceeded")), true);
        assert.equal(isIntlHttpError(new Error("socket hang up")), true);
        assert.equal(isIntlHttpError(new Error("Proxy connection failed")), true);
        assert.equal(isIntlHttpError(new Error("aborted")), true);
        assert.equal(isIntlHttpError(new Error("TLS connection error")), true);
    });

    it("matches by response.status", () => {
        assert.equal(isIntlHttpError({response: {status: 500}}), true);
        assert.equal(isIntlHttpError({response: {status: 404}}), false);
    });

    it("returns false when the response carries a non-transient status", () => {
        assert.equal(isIntlHttpError({message: "bad request", response: {status: 200}}), false);
        assert.equal(isIntlHttpError({message: "not found", response: {status: 404}}), false);
    });
});


describe("getResponseError", () => {
    it("prefers response.status|data", () => {
        const msg = getResponseError({response: {status: 500, data: "boom"}});
        assert.equal(msg, "500|boom");
    });

    it("falls back to response.data when status is missing", () => {
        assert.equal(getResponseError({response: {data: "only data"}}), "only data");
    });

    it("falls back to message when no response present", () => {
        assert.equal(getResponseError(new Error("plain")), "plain");
    });

    it("respects the limit parameter", () => {
        const long = "x".repeat(200);
        assert.equal(getResponseError(new Error(long), 10).length, 10);
    });
});