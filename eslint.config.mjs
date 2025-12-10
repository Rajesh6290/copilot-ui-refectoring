// eslint.config.mjs

import js from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";
import pluginNode from "eslint-plugin-node";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { createRequire } from "module";
import tseslint from "typescript-eslint";

const require = createRequire(import.meta.url);
const pluginReact = require("eslint-plugin-react");

/**
 * ESLint Flat Config for Next.js + TypeScript + React
 */
export default tseslint.config([
  // Ignore generated / build folders
  { ignores: ["dist", ".next", "node_modules"] },

  // Base JS + TS recommendations
  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly"
      },
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    },

    plugins: {
      react: pluginReact,
      "react-hooks": reactHooks,
      "jsx-a11y": pluginJsxA11y,
      node: pluginNode,
      import: pluginImport
    },

    settings: {
      react: { version: "detect" }
    },

    rules: {
      /**
       * React rules
       */
      ...pluginReact.configs.recommended.rules,
      ...pluginReact.configs["jsx-runtime"].rules,
      "react/prop-types": "off", // TypeScript handles this
      "react/react-in-jsx-scope": "off", // Next.js doesn't need this

      /**
       * React Hooks rules
       */
      ...reactHooks.configs.recommended.rules,

      /**
       * Accessibility rules
       */
      ...pluginJsxA11y.configs.recommended.rules,

      /**
       * Import / Node rules
       */
      "node/no-unsupported-features/es-syntax": "off",
      "node/no-extraneous-import": "error",
      "import/first": "error",
      "import/no-duplicates": "error",

      /**
       * Style rules
       */
      quotes: ["error", "double", { avoidEscape: true }],
      curly: ["error", "all"],

      camelcase: "off",
      "@typescript-eslint/naming-convention": [
        "error",
        { selector: "default", format: ["camelCase", "snake_case"] },
        { selector: "function", format: ["camelCase", "PascalCase"] },
        {
          selector: "variable",
          format: ["camelCase", "snake_case", "PascalCase", "UPPER_CASE"],
          leadingUnderscore: "allow"
        },
        {
          selector: "parameter",
          format: ["camelCase", "snake_case"],
          leadingUnderscore: "allow",
          filter: { regex: "^_$", match: false }
        },
        {
          selector: "parameter",
          format: null,
          filter: { regex: "^_$", match: true }
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
          leadingUnderscore: "allow"
        },
        { selector: "import", format: ["camelCase", "PascalCase"] },
        { selector: "objectLiteralProperty", format: null },
        { selector: ["property"], modifiers: ["destructured"], format: null }
      ],

      eqeqeq: ["error", "always"],
      "no-var": "error",
      "no-console": "error",
      "prefer-const": "error",
      "no-trailing-spaces": "error",
      "object-curly-spacing": ["error", "always"],
      "arrow-spacing": ["error", { before: true, after: true }],
      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
      "no-extra-boolean-cast": "error",

      "no-shadow": "error",
      "require-await": "error",
      "no-return-await": "error",
      "no-param-reassign": ["error", { props: false }],
      "no-use-before-define": ["error", { functions: false, classes: true }],

      "no-unused-vars": [
        "error",
        { argsIgnorePattern: "^", varsIgnorePattern: "^" }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^", varsIgnorePattern: "^" }
      ]
    }
  }
]);