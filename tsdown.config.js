import { defineConfig } from "tsdown";

export default defineConfig({
    entry: ["src/**/*.js"],
    format: ["esm", "cjs"],
    platform: "node",
    target: "node18",
    fixedExtension: true,
    unbundle: true,
    clean: true,
});
