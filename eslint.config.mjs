import Module, { createRequire } from "node:module";
import { defineConfig, globalIgnores } from "eslint/config";

/*
 * The project type-checks with TypeScript 7, but typescript-eslint (used by eslint-config-next) still needs
 * the TypeScript 6 API. Route its `require("typescript")` to @typescript/typescript6, for linting only.
 * Remove this once typescript-eslint supports TS 7 (https://github.com/typescript-eslint/typescript-eslint/issues/10940).
 */
const ts6 = createRequire(import.meta.url).resolve("@typescript/typescript6");
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  return resolve.call(this, request === "typescript" ? ts6 : request, ...rest);
};
// imported after the redirect is in place
const { default: nextVitals } = await import("eslint-config-next/core-web-vitals");
const { default: nextTs } = await import("eslint-config-next/typescript");

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
