import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/general.js", "src/node.js"],
    format: ["esm", "cjs"],
    platform: "node",
    target: "node18",
    fixedExtension: true,
    clean: true,
});