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
    deepFreeze,
    unwrapDefault,
    castString,
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
    fnv1a,
    cookiesFromResponse,
    cookiesToHeader,
    cookiesFromHeader,
    isTransientHttpCode,
    getResponseError,
    normalizeProxy,
    parseProxy,
    proxyValue
} from "../src/general.js";


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

    it("invokes onError on each failure and rethrows after attempts are exhausted", async () => {
        const errors = [];
        await assert.rejects(
            retry(
                async () => {throw new Error("nope");},
                3,
                (error, attempt) => errors.push([attempt, error.message])
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

    it("delegates to es-toolkit isEmpty for non-numbers", () => {
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


describe("deepFreeze", () => {
    it("returns primitives and nullish values untouched", () => {
        assert.equal(deepFreeze(1), 1);
        assert.equal(deepFreeze("a"), "a");
        assert.equal(deepFreeze(null), null);
        assert.equal(deepFreeze(undefined), undefined);
    });

    it("freezes nested objects and arrays, returning the same reference", () => {
        const input = {a: {b: {c: 1}}, list: [{d: 2}, [3]]};
        const result = deepFreeze(input);
        assert.strictEqual(result, input);
        assert.ok(Object.isFrozen(input));
        assert.ok(Object.isFrozen(input.a.b));
        assert.ok(Object.isFrozen(input.list));
        assert.ok(Object.isFrozen(input.list[0]));
        assert.ok(Object.isFrozen(input.list[1]));
        assert.throws(() => {
            input.a.b.c = 2;
        }, TypeError);
        assert.throws(() => input.list.push(4), TypeError);
    });

    it("freezes symbol keys, non-enumerable keys and class instances", () => {
        const key = Symbol("nested");
        class Holder {
            constructor() {
                this.inner = {x: 1};
            }
        }

        const input = {[key]: {y: 1}, instance: new Holder()};
        Object.defineProperty(input, "hidden", {value: {z: 1}, enumerable: false, writable: true});
        deepFreeze(input);
        assert.ok(Object.isFrozen(input[key]));
        assert.ok(Object.isFrozen(input.hidden));
        assert.ok(Object.isFrozen(input.instance.inner));
    });

    it("handles cycles without recursing forever", () => {
        const input = {name: "root"};
        input.self = input;
        input.child = {parent: input};
        deepFreeze(input);
        assert.ok(Object.isFrozen(input));
        assert.ok(Object.isFrozen(input.child));
    });

    it("descends into an already frozen container", () => {
        const child = {a: 1};
        const input = Object.freeze({child});
        deepFreeze(input);
        assert.ok(Object.isFrozen(child));
    });

    it("does not invoke getters", () => {
        let calls = 0;
        const input = {
            get lazy() {
                calls++;
                return {a: 1};
            }
        };
        deepFreeze(input);
        assert.equal(calls, 0);
        assert.ok(Object.isFrozen(input));
    });

    it("freezes Map contents and blocks its mutators", () => {
        const value = {a: 1};
        const key = {k: 1};
        const map = new Map([[key, value]]);
        deepFreeze(map);
        assert.ok(Object.isFrozen(map));
        assert.ok(Object.isFrozen(key));
        assert.ok(Object.isFrozen(value));
        assert.throws(() => map.set("b", 2), TypeError);
        assert.throws(() => map.delete(key), TypeError);
        assert.throws(() => map.clear(), TypeError);
        assert.equal(map.get(key), value);
    });

    it("freezes Set contents and blocks its mutators", () => {
        const item = {a: 1};
        const set = new Set([item]);
        deepFreeze(set);
        assert.ok(Object.isFrozen(item));
        assert.throws(() => set.add(2), TypeError);
        assert.throws(() => set.delete(item), TypeError);
        assert.throws(() => set.clear(), TypeError);
        assert.ok(set.has(item));
    });

    it("blocks WeakMap and WeakSet mutators", () => {
        const weakMap = new WeakMap();
        const weakSet = new WeakSet();
        deepFreeze({weakMap, weakSet});
        assert.throws(() => weakMap.set({}, 1), TypeError);
        assert.throws(() => weakSet.add({}), TypeError);
    });

    it("blocks Date setters while keeping readers usable", () => {
        const date = new Date(0);
        deepFreeze(date);
        assert.ok(Object.isFrozen(date));
        assert.throws(() => date.setTime(1000), TypeError);
        assert.throws(() => date.setFullYear(2000), TypeError);
        assert.equal(date.getTime(), 0);
    });

    it("seals RegExp so global patterns keep working", () => {
        const pattern = /a/g;
        deepFreeze({pattern});
        assert.equal(Object.isSealed(pattern), true);
        assert.equal(pattern.test("aa"), true);
        assert.equal(pattern.test("aa"), true);
        assert.throws(() => {
            pattern.extra = 1;
        }, TypeError);
    });

    it("leaves typed arrays and DataView untouched", () => {
        const typed = new Uint8Array([1, 2]);
        const view = new DataView(new ArrayBuffer(2));
        deepFreeze({typed, view});
        assert.equal(Object.isFrozen(typed), false);
        assert.equal(Object.isFrozen(view), false);
        typed[0] = 9;
        assert.equal(typed[0], 9);
    });

    it("freezes functions without touching their prototype", () => {
        class Klass {
        }

        const fn = () => 1;
        fn.meta = {a: 1};
        deepFreeze({fn, Klass});
        assert.ok(Object.isFrozen(fn));
        assert.ok(Object.isFrozen(fn.meta));
        assert.ok(Object.isFrozen(Klass));
        assert.equal(Object.isFrozen(Klass.prototype), false);
        Klass.prototype.added = () => 2;
        assert.equal(new Klass().added(), 2);
    });
});


describe("unwrapDefault", () => {
    it("returns primitives and nullish values untouched", () => {
        assert.equal(unwrapDefault(1), 1);
        assert.equal(unwrapDefault("a"), "a");
        assert.equal(unwrapDefault(null), null);
        assert.equal(unwrapDefault(undefined), undefined);
    });

    it("returns an object that has no default as-is", () => {
        const input = {a: 1};
        assert.strictEqual(unwrapDefault(input), input);
    });

    it("peels a single and a nested default", () => {
        const inner = {a: 1};
        assert.strictEqual(unwrapDefault({default: inner}), inner);
        assert.strictEqual(unwrapDefault({default: {default: {default: inner}}}), inner);
    });

    it("stops at a non-object default", () => {
        assert.equal(unwrapDefault({default: {default: 42}}), 42);
        assert.equal(unwrapDefault({default: null}), null);
    });

    it("unwraps a function export", () => {
        const fn = () => 1;
        assert.strictEqual(unwrapDefault({default: {default: fn}}), fn);
    });

    it("stops on a self-referencing default instead of looping forever", () => {
        const mod = {};
        mod.default = mod;
        assert.strictEqual(unwrapDefault(mod), mod);
    });

    it("stops on a circular default chain instead of looping forever", () => {
        const a = {}, b = {};
        a.default = b;
        b.default = a;
        assert.strictEqual(unwrapDefault(a), a);
    });
});


describe("castString", () => {
    it("returns empty string for null and undefined", () => {
        assert.equal(castString(null), "");
        assert.equal(castString(undefined), "");
    });

    it("returns strings unchanged", () => {
        assert.equal(castString("hi"), "hi");
        assert.equal(castString(""), "");
    });

    it("converts numbers, booleans and bigint via String()", () => {
        assert.equal(castString(0), "0");
        assert.equal(castString(123), "123");
        assert.equal(castString(-5), "-5");
        assert.equal(castString(3.14), "3.14");
        assert.equal(castString(false), "false");
        assert.equal(castString(true), "true");
        assert.equal(castString(10n), "10");
    });

    it("JSON-stringifies objects and arrays, keeping empties", () => {
        assert.equal(castString({a: 1}), '{"a":1}');
        assert.equal(castString({}), "{}");
        assert.equal(castString([1, 2]), "[1,2]");
        assert.equal(castString([]), "[]");
    });

    it("falls back to {} when JSON.stringify throws", () => {
        const circular = {};
        circular.self = circular;
        assert.equal(castString(circular), "{}");
        assert.equal(castString({a: 1n}), "{}");
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


describe("fnv1a", () => {
    it("matches the published FNV-1a 32-bit vectors", () => {
        assert.equal(parseInt(fnv1a(""), 36), 0x811c9dc5);
        assert.equal(parseInt(fnv1a("a"), 36), 0xe40c292c);
        assert.equal(parseInt(fnv1a("foobar"), 36), 0xbf9cf968);
    });

    it("hashes UTF-8 bytes rather than UTF-16 code units", () => {
        assert.equal(parseInt(fnv1a("ğ"), 36), 1888488164);
        assert.equal(parseInt(fnv1a("\u{1D11E}"), 36), 997838904);
    });

    it("is deterministic and separates near-identical inputs", () => {
        assert.equal(fnv1a("melperjs"), fnv1a("melperjs"));
        assert.notEqual(fnv1a("melperjs"), fnv1a("melperjt"));
    });

    it("routes non-string input through castString", () => {
        assert.equal(fnv1a(123), fnv1a("123"));
        assert.equal(fnv1a(null), fnv1a(""));
        assert.equal(fnv1a({a: 1}), fnv1a('{"a":1}'));
    });

    it("returns a base-36 string", () => {
        assert.match(fnv1a("melperjs"), /^[0-9a-z]+$/);
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


describe("normalizeProxy", () => {
    describe("plain host:port", () => {
        it("formats IP", () => {
            assert.equal(normalizeProxy("1.2.3.4:8080"), "http://1.2.3.4:8080");
        });
        it("formats FQDN", () => {
            assert.equal(normalizeProxy("proxy.example.com:8080"), "http://proxy.example.com:8080");
        });
        it("formats single-label hostname (localhost)", () => {
            assert.equal(normalizeProxy("localhost:8080"), "http://localhost:8080");
        });
        it("trims surrounding whitespace", () => {
            assert.equal(normalizeProxy("  1.2.3.4:8080  "), "http://1.2.3.4:8080");
        });
    });

    describe("scheme prefix", () => {
        it("preserves http://", () => {
            assert.equal(normalizeProxy("http://1.2.3.4:8080"), "http://1.2.3.4:8080");
        });
        it("preserves https://", () => {
            assert.equal(normalizeProxy("https://1.2.3.4:8080"), "https://1.2.3.4:8080");
        });
        it("preserves socks4://", () => {
            assert.equal(normalizeProxy("socks4://1.2.3.4:8080"), "socks4://1.2.3.4:8080");
        });
        it("preserves socks5://", () => {
            assert.equal(normalizeProxy("socks5://1.2.3.4:8080"), "socks5://1.2.3.4:8080");
        });
        it("preserves socks5h://", () => {
            assert.equal(normalizeProxy("socks5h://1.2.3.4:8080"), "socks5h://1.2.3.4:8080");
        });
        it("uses the protocol parameter when no scheme is present", () => {
            assert.equal(normalizeProxy("1.2.3.4:8080", "socks5"), "socks5://1.2.3.4:8080");
        });
        it("scheme in input overrides the protocol parameter", () => {
            assert.equal(normalizeProxy("socks5://1.2.3.4:8080", "https"), "socks5://1.2.3.4:8080");
        });
    });

    describe("auth via @ separator", () => {
        it("handles user:pass@host:port", () => {
            assert.equal(normalizeProxy("user:pass@1.2.3.4:8080"), "http://user:pass@1.2.3.4:8080");
        });
        it("handles scheme://user:pass@host:port", () => {
            assert.equal(normalizeProxy("https://user:pass@1.2.3.4:8080"), "https://user:pass@1.2.3.4:8080");
        });
        it("handles password containing @ (last @ wins)", () => {
            assert.equal(normalizeProxy("user:p@ss@1.2.3.4:8080"), "http://user:p@ss@1.2.3.4:8080");
        });
        it("handles username with provider params (dashes)", () => {
            assert.equal(normalizeProxy("user-session-abc:pass@1.2.3.4:8080"), "http://user-session-abc:pass@1.2.3.4:8080");
        });
    });

    describe("auth via colon separator (4-part)", () => {
        it("reorders host:port:user:pass to user:pass@host:port", () => {
            assert.equal(normalizeProxy("1.2.3.4:8080:user:pass"), "http://user:pass@1.2.3.4:8080");
        });
        it("works with scheme prefix", () => {
            assert.equal(normalizeProxy("socks5://1.2.3.4:8080:user:pass"), "socks5://user:pass@1.2.3.4:8080");
        });
        it("uses the protocol parameter when missing", () => {
            assert.equal(normalizeProxy("1.2.3.4:8080:user:pass", "https"), "https://user:pass@1.2.3.4:8080");
        });
        it("auto-detects user:pass:host:port (auth-first ordering)", () => {
            assert.equal(normalizeProxy("user:pass:1.2.3.4:8080"), "http://user:pass@1.2.3.4:8080");
        });
        it("auto-detects user:pass:host:port with scheme", () => {
            assert.equal(normalizeProxy("socks5://user:pass:1.2.3.4:8080"), "socks5://user:pass@1.2.3.4:8080");
        });
    });

    describe("port range (3-part) host:portStart:portEnd", () => {
        it("picks a random port in range", () => {
            const ports = new Set();
            for (let i = 0; i < 60; i++) {
                const result = normalizeProxy("1.2.3.4:8000:8010");
                const port = parseInt(result.split(":").pop());
                assert.ok(port >= 8000 && port <= 8010, `port ${port} outside [8000, 8010]`);
                ports.add(port);
            }
            assert.ok(ports.size > 1);
        });
    });

    describe("port range with auth (5-part) host:portStart:portEnd:user:pass", () => {
        it("picks a random port and reorders auth", () => {
            const ports = new Set();
            for (let i = 0; i < 60; i++) {
                const result = normalizeProxy("1.2.3.4:8000:8010:user:pass");
                assert.ok(result.startsWith("http://user:pass@1.2.3.4:"));
                const port = parseInt(result.split(":").pop());
                assert.ok(port >= 8000 && port <= 8010, `port ${port} outside [8000, 8010]`);
                ports.add(port);
            }
            assert.ok(ports.size > 1);
        });

        it("auto-detects user:pass:host:portStart:portEnd (auth-first ordering)", () => {
            const ports = new Set();
            for (let i = 0; i < 60; i++) {
                const result = normalizeProxy("user:pass:1.2.3.4:8000:8010");
                assert.ok(result.startsWith("http://user:pass@1.2.3.4:"));
                const port = parseInt(result.split(":").pop());
                assert.ok(port >= 8000 && port <= 8010);
                ports.add(port);
            }
            assert.ok(ports.size > 1);
        });

        it("handles user:pass@host:portStart:portEnd (@-auth with port range)", () => {
            const ports = new Set();
            for (let i = 0; i < 60; i++) {
                const result = normalizeProxy("user:pass@1.2.3.4:8000:8010");
                assert.ok(result.startsWith("http://user:pass@1.2.3.4:"));
                const port = parseInt(result.split(":").pop());
                assert.ok(port >= 8000 && port <= 8010);
                ports.add(port);
            }
            assert.ok(ports.size > 1);
        });
    });

    describe("ambiguous all-digit password (host heuristic)", () => {
        it("4-part: numeric user + dotted host resolves to auth-first", () => {
            assert.equal(normalizeProxy("1234:5678:1.2.3.4:8080"), "http://1234:5678@1.2.3.4:8080");
        });
        it("5-part: numeric user + dotted host resolves to auth-first", () => {
            const result = normalizeProxy("1234:5678:1.2.3.4:9000:9010");
            assert.ok(result.startsWith("http://1234:5678@1.2.3.4:"));
            const port = parseInt(result.split(":").pop());
            assert.ok(port >= 9000 && port <= 9010);
        });
        it("4-part: both sides letter-y stays in host-first fallback", () => {
            assert.equal(normalizeProxy("admin:1234:host:8080"), "http://host:8080@admin:1234");
        });
    });

    describe("edge cases (no crash)", () => {
        it("empty string returns empty", () => {
            assert.equal(normalizeProxy(""), null);
        });
        it("whitespace-only returns empty", () => {
            assert.equal(normalizeProxy("   "), null);
        });
        it("single token is preserved as host", () => {
            assert.equal(normalizeProxy("hostonly"), "http://hostonly");
        });
        it("3-part with non-numeric middle is left unchanged", () => {
            assert.equal(normalizeProxy("host:port:tail"), "http://host:port:tail");
        });
        it("3-part with numeric but reversed range (start > end) is left unchanged", () => {
            assert.equal(normalizeProxy("host:9000:8000"), "http://host:9000:8000");
        });
    });
});


describe("parseProxy", () => {
    it("decomposes a credentialled proxy into structured fields", () => {
        const obj = parseProxy("socks5://1.2.3.4:8080:user:pass");
        assert.deepEqual(obj, {
            protocol: "socks5",
            host: "1.2.3.4",
            port: 8080,
            auth: {username: "user", password: "pass"}
        });
    });

    it("omits auth when the proxy has no credentials", () => {
        const obj = parseProxy("1.2.3.4:8080");
        assert.equal(obj.protocol, "http");
        assert.equal(obj.host, "1.2.3.4");
        assert.equal(obj.port, 8080);
        assert.equal(obj.auth, undefined);
    });
});


describe("proxyValue", () => {
    it("returns null on empty input", () => {
        assert.equal(proxyValue(""), null);
        assert.equal(proxyValue(null), null);
    });

    it("auto-fills {SESSION} with a random 8-hex token by default", () => {
        const pool = `
            1.2.3.4:8080:user-{SESSION}:pass
            5.6.7.8:9090:user-{SESSION}:pass
        `;
        const result = proxyValue(pool);
        assert.ok(result.startsWith("http://"));
        assert.ok(!result.includes("{SESSION}"));
        assert.match(result, /user-[0-9a-f]{8}:pass@/);
    });

    it("treats a string SESSION as a seed via seedHex (deterministic)", () => {
        const pool = "1.2.3.4:8080:user-{SESSION}:pass";
        const a = proxyValue(pool, {SESSION: "abc"});
        const b = proxyValue(pool, {SESSION: "abc"});
        const c = proxyValue(pool, {SESSION: "xyz"});
        assert.equal(a, b);
        assert.notEqual(a, c);
        assert.match(a, /user-[0-9a-f]{8}:pass@/);
    });

    it("calls a function SESSION on each invocation", () => {
        const pool = "1.2.3.4:8080:user-{SESSION}:pass";
        let counter = 0;
        const result = proxyValue(pool, {SESSION: () => `fixed-${++counter}`});
        assert.match(result, /user-fixed-1:pass@/);
    });

    it("non-SESSION string values are used as literals (no seedHex)", () => {
        const pool = "1.2.3.4:8080:user-{ZONE}-{SESSION}:pass";
        const result = proxyValue(pool, {ZONE: "us"});
        assert.match(result, /user-us-[0-9a-f]{8}:pass@/);
    });

    it("non-SESSION function values are called normally", () => {
        const pool = "1.2.3.4:8080:user-{MYTOKEN}:pass";
        const result = proxyValue(pool, {MYTOKEN: () => "anything"});
        assert.match(result, /user-anything:pass@/);
    });
});