import nx from "@nx/eslint-plugin";
import baseConfig from "../../eslint.config.mjs";
// import js from "@eslint/js";
// import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
// import globals from "globals";

export default [
  ...baseConfig,
  ...nx.configs["flat/react"],
  {
    ignores: ["dist"],
  },
  // js.configs.recommended,
  // ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
];
