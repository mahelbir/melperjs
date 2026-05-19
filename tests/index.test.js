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
    retry,
    isValidURL,
    splitTrim,
    checkEmpty,
    pascalCase,
    titleCase,
    isInt32,
    isPositiveNumber,
    coerceObjectNumbers,
    coerceObjectIntegers,
    findNodeByKey,
    waitForProperty,
    shuffleObject,
    objectStringify,
    limitString,
    safeString,
    shuffleString,
    randomBoolean,
    randomString,
    randomHex,
    randomInteger,
    randomUuid,
    randomWeighted,
    randomElement,
    mulberry32,
    seedHex,
    cookiesFromResponse,
    cookiesToHeader,
    cookiesFromHeader,
    isTransientHttpCode,
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
    it("returns an Error with default name and empty response", () => {
        const err = Exception("boom");
        assert.ok(err instanceof Error);
        assert.equal(err.message, "boom");
        assert.equal(err.name, "Exception");
        assert.deepEqual(err.response, {});
    });

    it("honors custom name and response", () => {
        const err = Exception("nope", {status: 404, data: "x"}, "NotFound");
        assert.equal(err.name, "NotFound");
        assert.equal(err.response.status, 404);
        assert.equal(err.response.data, "x");
    });

    it("normalizes empty or nullish response to {}", () => {
        assert.deepEqual(Exception("e", null).response, {});
        assert.deepEqual(Exception("e", undefined).response, {});
        assert.deepEqual(Exception("e", {}).response, {});
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


describe("retry", () => {
    it("returns the first successful result", async () => {
        let calls = 0;
        const result = await retry(async () => {
            calls++;
            if (calls < 2) throw new Error("fail");
            return "ok";
        }, 5);
        assert.equal(result, "ok");
        assert.equal(calls, 2);
    });

    it("invokes errorFn on each failure and rethrows after attempts are exhausted", async () => {
        const errors = [];
        await assert.rejects(
            retry(
                async () => {throw new Error("nope");},
                3,
                (attempt, error) => errors.push([attempt, error.message])
            ),
            /nope/
        );
        assert.equal(errors.length, 3);
        assert.deepEqual(errors[0], [1, "nope"]);
    });

    it("waits delayMs between attempts but not after the last", async () => {
        const start = Date.now();
        await assert.rejects(retry(async () => {throw new Error("x");}, 3, null, {delayMs: 30}));
        const elapsed = Date.now() - start;
        assert.ok(elapsed >= 55, `expected >=55ms, got ${elapsed}ms`);
        assert.ok(elapsed < 120, `expected <120ms, got ${elapsed}ms`);
    });

    it("applies exponential backoff when backoffFactor > 1", async () => {
        // 4 attempts, delayMs=10, factor=2 → delays of 10, 20, 40 = 70ms total
        const start = Date.now();
        await assert.rejects(retry(async () => {throw new Error("x");}, 4, null, {delayMs: 10, backoffFactor: 2}));
        const elapsed = Date.now() - start;
        assert.ok(elapsed >= 65, `expected >=65ms, got ${elapsed}ms`);
        assert.ok(elapsed < 130, `expected <130ms, got ${elapsed}ms`);
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


describe("splitTrim", () => {
    it("splits on newlines and trims/filters empty lines by default", () => {
        const result = splitTrim("\n  a  \n\n  b  \n");
        assert.deepEqual(result, ["a", "b"]);
    });

    it("accepts a custom separator", () => {
        assert.deepEqual(splitTrim("a, b,  ,c", ","), ["a", "b", "c"]);
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


describe("isPositiveNumber", () => {
    it("accepts positive finite numbers", () => {
        assert.equal(isPositiveNumber(1), true);
        assert.equal(isPositiveNumber(0.0001), true);
        assert.equal(isPositiveNumber(Number.MAX_SAFE_INTEGER), true);
    });

    it("rejects zero, negatives, NaN, Infinity, strings and nullish values", () => {
        assert.equal(isPositiveNumber(0), false);
        assert.equal(isPositiveNumber(-1), false);
        assert.equal(isPositiveNumber(NaN), false);
        assert.equal(isPositiveNumber(Infinity), false);
        assert.equal(isPositiveNumber("5"), false);
        assert.equal(isPositiveNumber(null), false);
        assert.equal(isPositiveNumber(undefined), false);
    });
});


describe("coerceObjectNumbers / coerceObjectIntegers", () => {
    it("coerceObjectNumbers converts strict numeric strings to numbers in place", () => {
        const obj = {a: "1.5", b: "2", c: "x", d: "1_000", e: 3, f: "002", g: "1,000", h: "12abc", i: "0xFF"};
        const result = coerceObjectNumbers(obj);
        assert.strictEqual(result, obj);
        assert.equal(obj.a, 1.5);
        assert.equal(obj.b, 2);
        assert.equal(obj.c, "x");
        assert.equal(obj.d, "1_000");
        assert.equal(obj.e, 3);
        assert.equal(obj.f, 2);
        assert.equal(obj.g, "1,000");
        assert.equal(obj.h, "12abc");
        assert.equal(obj.i, "0xFF");
    });

    it("coerceObjectIntegers only converts whole integer strings (zero-padded allowed)", () => {
        const obj = {a: "5", b: "1.5", c: "x", d: "002", e: "-7", f: "12abc"};
        coerceObjectIntegers(obj);
        assert.equal(obj.a, 5);
        assert.equal(obj.b, "1.5");
        assert.equal(obj.c, "x");
        assert.equal(obj.d, 2);
        assert.equal(obj.e, -7);
        assert.equal(obj.f, "12abc");
    });
});


describe("findNodeByKey", () => {
    it("returns the nearest node containing the given key", () => {
        const tree = {a: {b: {c: 1, target: "x"}}};
        assert.deepEqual(findNodeByKey("target", tree), {c: 1, target: "x"});
    });

    it("matches by key/value pair when provided", () => {
        const tree = {a: {flag: false}, b: {flag: true}};
        assert.deepEqual(findNodeByKey("flag", tree, true), {flag: true});
    });

    it("matches falsy pair values (false / 0 / empty string)", () => {
        assert.deepEqual(findNodeByKey("flag", {a: {flag: true}, b: {flag: false}}, false), {flag: false});
        assert.deepEqual(findNodeByKey("count", {a: {count: 3}, b: {count: 0}}, 0), {count: 0});
    });

    it("returns null when nothing matches", () => {
        assert.equal(findNodeByKey("missing", {a: 1}), null);
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


describe("shuffleObject", () => {
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


describe("randomBoolean", () => {
    it("returns a boolean", () => {
        assert.equal(typeof randomBoolean(), "boolean");
    });

    it("produces both values across many samples", () => {
        const seen = new Set();
        for (let i = 0; i < 200 && seen.size < 2; i++) seen.add(randomBoolean());
        assert.equal(seen.size, 2);
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
    it("returns an integer in [min, max)", () => {
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
    it("can return every key in an equally weighted dict", () => {
        const dict = {a: 1, b: 1, c: 1};
        const seen = new Set();
        for (let i = 0; i < 200 && seen.size < 3; i++) seen.add(randomWeighted(dict));
        assert.equal(seen.size, 3);
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

    it("returns undefined for empty/missing input", () => {
        assert.equal(randomElement([]), undefined);
        assert.equal(randomElement({}), undefined);
        assert.equal(randomElement(null), undefined);
        assert.equal(randomElement(undefined), undefined);
    });
});


describe("mulberry32", () => {
    it("returns a deterministic PRNG seeded by int", () => {
        const a = mulberry32(42);
        const b = mulberry32(42);
        const c = mulberry32(99);
        assert.equal(a(), b());
        assert.equal(a(), b());
        assert.notEqual(mulberry32(42)(), c());
    });

    it("accepts a string seed", () => {
        assert.equal(mulberry32("abc")(), mulberry32("abc")());
        assert.notEqual(mulberry32("abc")(), mulberry32("xyz")());
    });

    it("returns floats in [0, 1)", () => {
        const rng = mulberry32("test");
        for (let i = 0; i < 50; i++) {
            const v = rng();
            assert.ok(v >= 0 && v < 1);
        }
    });
});


describe("seedHex", () => {
    it("returns deterministic hex of requested length", () => {
        assert.equal(seedHex("abc", 8), seedHex("abc", 8));
        assert.equal(seedHex("abc", 8).length, 8);
        assert.match(seedHex("abc", 8), /^[0-9a-f]+$/);
    });

    it("respects the length parameter", () => {
        assert.equal(seedHex("abc", 16).length, 16);
        assert.equal(seedHex("abc", 32).length, 32);
        assert.equal(seedHex("abc", 1).length, 1);
    });

    it("produces different output for different seeds", () => {
        assert.notEqual(seedHex("a", 8), seedHex("b", 8));
    });
});


describe("cookiesFromResponse / cookiesToHeader / cookiesFromHeader", () => {
    it("cookiesFromResponse parses set-cookie headers into a flat name/value map", () => {
        const res = {headers: {"set-cookie": ["a=1; Path=/", "b=2; Path=/"]}};
        assert.deepEqual(cookiesFromResponse(res), {a: "1", b: "2"});
    });

    it("cookiesToHeader serializes a map into a cookie header string", () => {
        assert.equal(cookiesToHeader({a: "1", b: "2"}), "a=1; b=2");
    });

    it("cookiesToHeader filters null/undefined values and tolerates empty input", () => {
        assert.equal(cookiesToHeader({a: "1", b: null, c: undefined, d: ""}), "a=1; d=");
        assert.equal(cookiesToHeader(undefined), "");
        assert.equal(cookiesToHeader(null), "");
    });

    it("cookiesFromHeader parses a cookie header into an object", () => {
        assert.deepEqual(cookiesFromHeader("a=1; b=2; c="), {a: "1", b: "2", c: ""});
    });

    it("cookiesFromHeader returns an empty object for empty input", () => {
        assert.deepEqual(cookiesFromHeader(""), {});
        assert.deepEqual(cookiesFromHeader(null), {});
    });

    it("cookiesFromHeader keeps '=' inside values", () => {
        assert.deepEqual(cookiesFromHeader("token=a=b=c"), {token: "a=b=c"});
    });
});


describe("isTransientHttpCode", () => {
    it("flags missing or transient codes", () => {
        assert.equal(isTransientHttpCode(undefined), true);
        assert.equal(isTransientHttpCode(null), true);
        assert.equal(isTransientHttpCode(0), true);
        assert.equal(isTransientHttpCode(100), true);
        assert.equal(isTransientHttpCode(402), true);
        assert.equal(isTransientHttpCode(407), true);
        assert.equal(isTransientHttpCode(460), true);
        assert.equal(isTransientHttpCode(469), true);
        assert.equal(isTransientHttpCode(500), true);
        assert.equal(isTransientHttpCode(503), true);
    });

    it("treats normal 2xx/3xx/4xx codes as not transient", () => {
        assert.equal(isTransientHttpCode(200), false);
        assert.equal(isTransientHttpCode(301), false);
        assert.equal(isTransientHttpCode(404), false);
        assert.equal(isTransientHttpCode(470), false);
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