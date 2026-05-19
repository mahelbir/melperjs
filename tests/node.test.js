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
    normalizeProxy,
    parseProxy,
    proxyValue,
    readJsonFile,
    readJsonFileSync,
    writeJsonFile,
    writeJsonFileSync,
    clearDirectory
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