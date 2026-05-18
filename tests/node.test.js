import {describe, it, after} from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

import {
    tokenBoolean,
    tokenString,
    tokenHex,
    tokenInteger,
    tokenUuid,
    tokenWeighted,
    tokenElement,
    seedUuid,
    executeCommand,
    serverIp,
    getVersion,
    createNumDir,
    hash,
    md5,
    sha256,
    base64Encode,
    base64Decode,
    hashBcrypt,
    verifyBcrypt,
    formatProxy,
    proxyObject,
    proxyValue,
    readJsonFile,
    readJsonFileSync,
    writeJsonFile,
    writeJsonFileSync,
    cleanDirectory
} from "../src/node.js";


const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "melperjs-tests-"));
after(async () => {
    await fsp.rm(tmpRoot, {recursive: true, force: true});
});

const tmpPath = (name) => path.join(tmpRoot, `${name}-${crypto.randomUUID()}`);


describe("tokenBoolean", () => {
    it("returns a boolean", () => {
        assert.equal(typeof tokenBoolean(), "boolean");
    });

    it("produces both values across many samples", () => {
        const seen = new Set();
        for (let i = 0; i < 200 && seen.size < 2; i++) seen.add(tokenBoolean());
        assert.equal(seen.size, 2);
    });
});


describe("tokenString", () => {
    it("respects length and default charset", () => {
        const s = tokenString(32);
        assert.equal(s.length, 32);
        assert.match(s, /^[a-z0-9]+$/);
    });

    it("excludes numbers when useNumbers=false", () => {
        assert.match(tokenString(40, false), /^[a-z]+$/);
    });

    it("can produce uppercase letters when requested", () => {
        let hasUpper = false;
        for (let i = 0; i < 30 && !hasUpper; i++) {
            if (/[A-Z]/.test(tokenString(50, true, true))) hasUpper = true;
        }
        assert.ok(hasUpper);
    });
});


describe("tokenHex / tokenInteger", () => {
    it("tokenHex returns only hex chars of the requested length", () => {
        const h = tokenHex(24);
        assert.equal(h.length, 24);
        assert.match(h, /^[0-9a-f]+$/);
    });

    it("tokenInteger returns an integer in [min, max)", () => {
        for (let i = 0; i < 100; i++) {
            const n = tokenInteger(10, 20);
            assert.ok(Number.isInteger(n));
            assert.ok(n >= 10 && n < 20);
        }
    });
});


describe("tokenUuid", () => {
    it("returns a UUID with dashes by default", () => {
        const id = tokenUuid();
        assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it("strips dashes when requested", () => {
        const id = tokenUuid(false);
        assert.equal(id.length, 32);
        assert.match(id, /^[0-9a-f]{32}$/);
    });
});


describe("tokenWeighted / tokenElement", () => {
    it("tokenWeighted returns one of the dictionary keys", () => {
        const dict = {a: 1, b: 1, c: 1};
        for (let i = 0; i < 100; i++) {
            assert.ok(["a", "b", "c"].includes(tokenWeighted(dict)));
        }
    });

    it("tokenElement returns an array element", () => {
        const arr = ["x", "y", "z"];
        for (let i = 0; i < 20; i++) {
            assert.ok(arr.includes(tokenElement(arr)));
        }
    });

    it("tokenElement returns a value when given an object", () => {
        const obj = {a: 1, b: 2, c: 3};
        for (let i = 0; i < 20; i++) {
            assert.ok([1, 2, 3].includes(tokenElement(obj)));
        }
    });
});


describe("seedUuid", () => {
    it("produces the same UUID for the same seed", () => {
        const a = seedUuid("seed-1");
        const b = seedUuid("seed-1");
        assert.equal(a, b);
    });

    it("produces different UUIDs for different seeds", () => {
        assert.notEqual(seedUuid("a"), seedUuid("b"));
    });

    it("returns a UUID-shaped string with the v4 variant bits set", () => {
        const id = seedUuid("anything");
        assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
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


describe("serverIp", () => {
    it("returns a string (IP or 127.0.0.1 fallback)", () => {
        const ip = serverIp();
        assert.equal(typeof ip, "string");
        assert.match(ip, /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
    });
});


describe("getVersion", () => {
    it("returns a non-empty string", () => {
        const v = getVersion();
        assert.equal(typeof v, "string");
        assert.ok(v.length > 0);
        assert.ok(v === "1.0" || /^\d{6}\.\d{4}$/.test(v));
    });
});


describe("createNumDir", () => {
    it("creates the parent directory and numbered subdirectories", () => {
        const dir = tmpPath("numdir");
        createNumDir(dir, 0, 4);
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


describe("hashBcrypt / verifyBcrypt", () => {
    it("verifies a correct plaintext+key against its hash", () => {
        const hashed = hashBcrypt("password", "pepper", 4);
        assert.equal(verifyBcrypt("password", hashed, "pepper"), true);
    });

    it("rejects a wrong plaintext or wrong key", () => {
        const hashed = hashBcrypt("password", "pepper", 4);
        assert.equal(verifyBcrypt("password", hashed, "wrong"), false);
        assert.equal(verifyBcrypt("nope", hashed, "pepper"), false);
    });
});


describe("formatProxy", () => {
    it("reorders host:port:user:pass into user:pass@host:port with default protocol", () => {
        assert.equal(formatProxy("1.2.3.4:8080:user:pass"), "http://user:pass@1.2.3.4:8080");
    });

    it("keeps an explicit protocol prefix", () => {
        assert.equal(formatProxy("socks5://1.2.3.4:8080:user:pass"), "socks5://user:pass@1.2.3.4:8080");
    });

    it("uses the provided protocol parameter when missing", () => {
        assert.equal(formatProxy("1.2.3.4:8080:user:pass", "https"), "https://user:pass@1.2.3.4:8080");
    });

    it("leaves an already user:pass@host:port-shaped proxy alone", () => {
        assert.equal(formatProxy("user:pass@1.2.3.4:8080"), "http://user:pass@1.2.3.4:8080");
    });

    it("picks a port from a numeric range", () => {
        const ports = new Set();
        for (let i = 0; i < 60; i++) {
            const result = formatProxy("1.2.3.4:8000:8010:user:pass");
            const port = parseInt(result.split(":").pop());
            assert.ok(port >= 8000 && port <= 8010, `port ${port} outside [8000, 8010]`);
            ports.add(port);
        }
        assert.ok(ports.size > 1, "expected randomization to produce more than one port");
    });
});


describe("proxyObject", () => {
    it("decomposes a credentialled proxy into structured fields", () => {
        const obj = proxyObject("socks5://1.2.3.4:8080:user:pass");
        assert.deepEqual(obj, {
            protocol: "socks5",
            host: "1.2.3.4",
            port: 8080,
            auth: {username: "user", password: "pass"}
        });
    });

    it("omits auth when the proxy has no credentials", () => {
        const obj = proxyObject("1.2.3.4:8080");
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

    it("picks one of the supplied proxies and replaces {SESSION}", () => {
        const pool = `
            1.2.3.4:8080:user-{SESSION}:pass
            5.6.7.8:9090:user-{SESSION}:pass
        `;
        const result = proxyValue(pool);
        assert.ok(result.startsWith("http://"));
        assert.ok(!result.includes("{SESSION}"));
        assert.match(result, /user-[0-9a-f]{8}:pass@/);
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


describe("cleanDirectory", () => {
    it("removes files and nested directories but keeps the root when keepDir=true", async () => {
        const dir = tmpPath("clean-keep");
        await fsp.mkdir(path.join(dir, "nested"), {recursive: true});
        await fsp.writeFile(path.join(dir, "a.txt"), "hello");
        await fsp.writeFile(path.join(dir, "nested", "b.txt"), "world");

        await cleanDirectory(dir, true);

        assert.ok(fs.existsSync(dir));
        const entries = await fsp.readdir(dir);
        assert.deepEqual(entries, []);
    });

    it("removes the root directory itself when keepDir=false", async () => {
        const dir = tmpPath("clean-remove");
        await fsp.mkdir(dir, {recursive: true});
        await fsp.writeFile(path.join(dir, "x.txt"), "data");

        await cleanDirectory(dir, false);

        assert.equal(fs.existsSync(dir), false);
    });

    it("creates the directory when missing and keepDir=true", async () => {
        const dir = tmpPath("clean-create");
        await cleanDirectory(dir, true);
        assert.ok(fs.existsSync(dir));
    });
});