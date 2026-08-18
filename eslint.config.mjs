import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { ignores: ["dist/**"] },
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.ts"],
    extends: [tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
]);
