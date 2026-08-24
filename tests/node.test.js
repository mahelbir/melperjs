import {describe, it, after} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

import {
    secureRandomBoolean,
    secureRandomString,
    secureRandomHex,
    secureRandomInteger,
    secureRandomUuid,
    secureRandomWeighted,
    secureRandomElement,
    uuidFromSeed,
    executeCommand,
    hostIp,
    gitVersion,
    createNumberedDirs,
    hash,
    md5,
    sha256,
    base64Encode,
    base64Decode,
    bcryptHash,
    bcryptVerify,
    readJsonFile,
    readJsonFileSync,
    writeJsonFile,
    writeJsonFileSync,
    clearDirectory,
    sleepMsSync,
    sleepSync
} from "../src/node.js";


const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "melperjs-tests-"));
after(async () => {
    await fsp.rm(tmpRoot, {recursive: true, force: true});
});

const tmpPath = (name) => path.join(tmpRoot, `${name}-${crypto.randomUUID()}`);


describe("secureRandomBoolean", () => {
    it("returns a boolean", () => {
        assert.equal(typeof secureRandomBoolean(), "boolean");
    });

    it("produces both values across many samples", () => {
        const seen = new Set();
        for (let i = 0; i < 200 && seen.size < 2; i++) seen.add(secureRandomBoolean());
        assert.equal(seen.size, 2);
    });
});


describe("secureRandomString", () => {
    it("respects length and default charset", () => {
        const s = secureRandomString(32);
        assert.equal(s.length, 32);
        assert.match(s, /^[a-z0-9]+$/);
    });

    it("excludes numbers when useNumbers=false", () => {
        assert.match(secureRandomString(40, false), /^[a-z]+$/);
    });

    it("can produce uppercase letters when requested", () => {
        let hasUpper = false;
        for (let i = 0; i < 30 && !hasUpper; i++) {
            if (/[A-Z]/.test(secureRandomString(50, true, true))) hasUpper = true;
        }
        assert.ok(hasUpper);
    });
});


describe("secureRandomHex / secureRandomInteger", () => {
    it("secureRandomHex returns only hex chars of the requested length", () => {
        const h = secureRandomHex(24);
        assert.equal(h.length, 24);
        assert.match(h, /^[0-9a-f]+$/);
    });

    it("secureRandomInteger returns an integer in [min, max)", () => {
        for (let i = 0; i < 100; i++) {
            const n = secureRandomInteger(10, 20);
            assert.ok(Number.isInteger(n));
            assert.ok(n >= 10 && n < 20);
        }
    });
});


describe("secureRandomUuid", () => {
    it("returns a UUID with dashes by default", () => {
        const id = secureRandomUuid();
        assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it("strips dashes when requested", () => {
        const id = secureRandomUuid(false);
        assert.equal(id.length, 32);
        assert.match(id, /^[0-9a-f]{32}$/);
    });
});


describe("secureRandomWeighted / secureRandomElement", () => {
    it("secureRandomWeighted can return every key in an equally weighted dict", () => {
        const dict = {a: 1, b: 1, c: 1};
        const seen = new Set();
        for (let i = 0; i < 200 && seen.size < 3; i++) seen.add(secureRandomWeighted(dict));
        assert.equal(seen.size, 3);
    });

    it("secureRandomWeighted returns undefined for falsy input", () => {
        assert.equal(secureRandomWeighted(null), undefined);
        assert.equal(secureRandomWeighted(undefined), undefined);
    });

    it("secureRandomElement returns an array element", () => {
        const arr = ["x", "y", "z"];
        for (let i = 0; i < 20; i++) {
            assert.ok(arr.includes(secureRandomElement(arr)));
        }
    });

    it("secureRandomElement returns a value when given an object", () => {
        const obj = {a: 1, b: 2, c: 3};
        for (let i = 0; i < 20; i++) {
            assert.ok([1, 2, 3].includes(secureRandomElement(obj)));
        }
    });

    it("secureRandomElement returns undefined for empty/missing input", () => {
        assert.equal(secureRandomElement([]), undefined);
        assert.equal(secureRandomElement({}), undefined);
        assert.equal(secureRandomElement(null), undefined);
        assert.equal(secureRandomElement(undefined), undefined);
    });
});


describe("uuidFromSeed", () => {
    it("produces the same UUID for the same seed", () => {
        const a = uuidFromSeed("seed-1");
        const b = uuidFromSeed("seed-1");
        assert.equal(a, b);
    });

    it("produces different UUIDs for different seeds", () => {
        assert.notEqual(uuidFromSeed("a"), uuidFromSeed("b"));
    });

    it("returns a UUID-shaped string with RFC 4122 v3 version and variant bits", () => {
        const id = uuidFromSeed("anything");
        assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it("strips dashes when useDashes=false", () => {
        const id = uuidFromSeed("anything", false);
        assert.equal(id.length, 32);
        assert.match(id, /^[0-9a-f]{32}$/);
    });
});


describe("executeCommand", () => {
    it("resolves with trimmed stdout", async () => {
        const out = await executeCommand("echo hello");
        assert.equal(out, "hello");
    });

    it("rejects on a failing command", async () => {
        await assert.rejects(executeCommand("node -e \"process.exit(1)\""));
    });
});


describe("hostIp", () => {
    it("returns a string (IP or 127.0.0.1 fallback)", () => {
        const ip = hostIp();
        assert.equal(typeof ip, "string");
        assert.match(ip, /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });
});


describe("gitVersion", () => {
    it("returns either a YYMMDD.HHMM string or the '1.0' fallback", () => {
        const v = gitVersion();
        assert.equal(typeof v, "string");
        assert.ok(v === "1.0" || /^\d{6}\.\d{4}$/.test(v), `unexpected version: ${v}`);
    });
});


describe("createNumberedDirs", () => {
    it("creates the parent directory and numbered subdirectories", () => {
        const dir = tmpPath("numdir");
        createNumberedDirs(dir, 0, 4);
        assert.ok(fs.existsSync(dir));
        for (let i = 0; i <= 4; i++) {
            assert.ok(fs.existsSync(path.join(dir, i.toString())));
        }
    });
});


describe("hash / md5 / sha256", () => {
    it("hash matches Node's crypto output", () => {
        const expected = crypto.createHash("sha1").update("abc").digest("hex");
        assert.equal(hash("sha1", "abc"), expected);
    });

    it("md5 produces a 32-char hex digest", () => {
        const digest = md5("hello");
        assert.equal(digest.length, 32);
        assert.match(digest, /^[0-9a-f]{32}$/);
        assert.equal(digest, "5d41402abc4b2a76b9719d911017c592");
    });

    it("sha256 produces a 64-char hex digest", () => {
        const digest = sha256("hello");
        assert.equal(digest.length, 64);
        assert.match(digest, /^[0-9a-f]{64}$/);
    });
});


describe("base64Encode / base64Decode", () => {
    it("round-trips utf-8 strings", () => {
        const encoded = base64Encode("merhaba dünya");
        assert.equal(base64Decode(encoded), "merhaba dünya");
    });

    it("encodes ASCII the same way Buffer does", () => {
        assert.equal(base64Encode("abc"), "YWJj");
        assert.equal(base64Decode("YWJj"), "abc");
    });

    it("respects the encoding parameter", () => {
        assert.equal(base64Decode("YWJj", "hex"), "616263");
    });
});


describe("bcryptHash / bcryptVerify", () => {
    it("verifies a correct plaintext+key against its hash", () => {
        const hashed = bcryptHash("password", {key: "secret", strength: 4});
        assert.equal(bcryptVerify("password", hashed, {key: "secret"}), true);
    });

    it("rejects a wrong plaintext or wrong key", () => {
        const hashed = bcryptHash("password", {key: "secret", strength: 4});
        assert.equal(bcryptVerify("password", hashed, {key: "wrong"}), false);
        assert.equal(bcryptVerify("nope", hashed, {key: "secret"}), false);
    });

    it("distinguishes long passwords that would collide under raw bcrypt (preHash=true)", () => {
        const long = "a".repeat(75);
        const longerSuffix = long + "different";
        const h1 = bcryptHash(long, {strength: 4});
        const h2 = bcryptHash(longerSuffix, {strength: 4});
        assert.equal(bcryptVerify(long, h1), true);
        assert.equal(bcryptVerify(longerSuffix, h2), true);
        assert.equal(bcryptVerify(long, h2), false);
        assert.equal(bcryptVerify(longerSuffix, h1), false);
    });

    it("can disable pre-hashing for back-compat with preHash=false", () => {
        const hashed = bcryptHash("password", {key: "secret", strength: 4, preHash: false});
        assert.equal(bcryptVerify("password", hashed, {key: "secret", preHash: false}), true);
        // Mismatched preHash flag should not verify
        assert.equal(bcryptVerify("password", hashed, {key: "secret"}), false);
    });

    it("throws on a missing hash when dummy is off", () => {
        assert.throws(() => bcryptVerify("password", null));
        assert.throws(() => bcryptVerify("password", undefined));
    });

    it("returns false instead of throwing when dummy is set", () => {
        assert.equal(bcryptVerify("password", null, {dummy: 4}), false);
        assert.equal(bcryptVerify("password", "", {dummy: 4}), false);
    });

    it("spends real bcrypt work on a missing hash so timing does not leak", () => {
        const start = Date.now();
        bcryptVerify("password", null, {dummy: true});
        assert.ok(Date.now() - start > 20, "dummy path returned too fast");
    });

    it("treats a number as the dummy cost factor", () => {
        const start = Date.now();
        assert.equal(bcryptVerify("password", null, {dummy: 4}), false);
        assert.ok(Date.now() - start < 100, "dummy ignored the requested cost factor");
    });

    it("ignores dummy when a real hash is given", () => {
        const hashed = bcryptHash("password", {key: "secret", strength: 4});
        assert.equal(bcryptVerify("password", hashed, {key: "secret", dummy: 4}), true);
        assert.equal(bcryptVerify("wrong", hashed, {key: "secret", dummy: 4}), false);
    });
});


describe("readJsonFile / writeJsonFile (async)", () => {
    it("round-trips JSON via the async helpers", async () => {
        const file = tmpPath("data") + ".json";
        await writeJsonFile(file, {a: 1, b: [2, 3]});
        const data = await readJsonFile(file);
        assert.deepEqual(data, {a: 1, b: [2, 3]});
    });

    it("readJsonFile returns the default value when the file is missing", async () => {
        const data = await readJsonFile(tmpPath("missing") + ".json", {fallback: true});
        assert.deepEqual(data, {fallback: true});
    });
});


describe("readJsonFileSync / writeJsonFileSync", () => {
    it("round-trips JSON via the sync helpers", () => {
        const file = tmpPath("sync") + ".json";
        writeJsonFileSync(file, {x: "y"});
        assert.deepEqual(readJsonFileSync(file), {x: "y"});
    });

    it("returns the default value when the file is missing", () => {
        assert.deepEqual(readJsonFileSync(tmpPath("missing-sync") + ".json", []), []);
    });
});


describe("clearDirectory", () => {
    it("removes files and nested directories but keeps the root when keepDir=true", async () => {
        const dir = tmpPath("clean-keep");
        await fsp.mkdir(path.join(dir, "nested"), {recursive: true});
        await fsp.writeFile(path.join(dir, "a.txt"), "hello");
        await fsp.writeFile(path.join(dir, "nested", "b.txt"), "world");

        await clearDirectory(dir, true);

        assert.ok(fs.existsSync(dir));
        const entries = await fsp.readdir(dir);
        assert.deepEqual(entries, []);
    });

    it("removes the root directory itself when keepDir=false", async () => {
        const dir = tmpPath("clean-remove");
        await fsp.mkdir(dir, {recursive: true});
        await fsp.writeFile(path.join(dir, "x.txt"), "data");

        await clearDirectory(dir, false);

        assert.equal(fs.existsSync(dir), false);
    });

    it("creates the directory when missing and keepDir=true", async () => {
        const dir = tmpPath("clean-create");
        await clearDirectory(dir, true);
        assert.ok(fs.existsSync(dir));
    });
});

describe("sleepMsSync / sleepSync", () => {
    it("sleepMsSync blocks for roughly the requested duration", () => {
        const start = Date.now();
        sleepMsSync(60);
        const elapsed = Date.now() - start;
        assert.ok(elapsed >= 55 && elapsed < 400, `elapsed ${elapsed}`);
    });

    it("sleepSync(seconds) delegates to sleepMsSync", () => {
        const start = Date.now();
        sleepSync(0.06);
        const elapsed = Date.now() - start;
        assert.ok(elapsed >= 55 && elapsed < 400, `elapsed ${elapsed}`);
    });

    it("blocks the event loop while waiting", () => {
        let timerFired = false;
        setTimeout(() => (timerFired = true), 0);
        sleepMsSync(30);
        assert.equal(timerFired, false);
    });

    it("returns immediately for zero, negative and non-numeric input", () => {
        const start = Date.now();
        for (const value of [0, -100, NaN, undefined, null, "abc"]) sleepMsSync(value);
        assert.ok(Date.now() - start < 100);
    });
});