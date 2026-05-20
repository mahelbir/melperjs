import {describe, test} from "node:test";
import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const MODULES = [
    {name: "general", src: "src/general.js", esm: "dist/general.mjs", cjs: "dist/general.cjs"},
    {name: "node", src: "src/node.js", esm: "dist/node.mjs", cjs: "dist/node.cjs"},
];

for (const mod of MODULES) {
    const esmPath = path.join(ROOT, mod.esm);
    const cjsPath = path.join(ROOT, mod.cjs);
    const srcPath = path.join(ROOT, mod.src);

    const buildAvailable = existsSync(esmPath) && existsSync(cjsPath);
    const skipReason = buildAvailable ? false : "build artifacts missing — run `npm run build` first";

    const src = await import(srcPath);
    const esm = buildAvailable ? await import(esmPath) : null;
    const cjsMod = buildAvailable ? await import(cjsPath) : null;
    const cjs = cjsMod ? (cjsMod.default || cjsMod) : null;

    describe(`build artifacts (${mod.name})`, () => {
        test("ESM and CJS expose the same set of named exports", {skip: skipReason}, () => {
            const esmKeys = Object.keys(esm).filter((k) => k !== "default").sort();
            const cjsKeys = Object.keys(cjs).filter((k) => k !== "default").sort();
            assert.deepEqual(esmKeys, cjsKeys, "ESM/CJS export sets differ");
        });

        test("ESM and CJS exports match src named exports", {skip: skipReason}, () => {
            const srcKeys = Object.keys(src).filter((k) => k !== "default").sort();
            const esmKeys = Object.keys(esm).filter((k) => k !== "default").sort();
            assert.deepEqual(esmKeys, srcKeys, "ESM exports diverge from src");
        });

        test("ESM and CJS exports are all values of the same type", {skip: skipReason}, () => {
            for (const k of Object.keys(esm)) {
                if (k === "default") continue;
                assert.equal(
                    typeof esm[k],
                    typeof cjs[k],
                    `type mismatch for export "${k}": esm=${typeof esm[k]} cjs=${typeof cjs[k]}`,
                );
            }
        });
    });
}