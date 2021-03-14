/* eslint-disable import/no-commonjs */
/** @type {import('eslint').Linter.Config} */
const fs = require("fs")
const path = require("path")

const schemaPath = path.join(
  process.cwd(),
  "api",
  "src",
  "node_modules",
  "@tempo",
  "typeDefs.js",
)

const schemaString = fs
  .readFileSync(schemaPath, "utf-8")
  .replace("export const typeDefs = `", "")
  .replace("`", "")

module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    allowImportExportEverywhere: true, // dynamic import
  },
  extends: ["standard", "eslint:recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    self: true,
    caches: true,
    fetch: true,
  },
  plugins: [
    "@typescript-eslint",
    "svelte3",
    "node",
    "import",
    "json",
    "graphql",
  ],
  overrides: [
    {
      files: ["**/*.svelte"],
      processor: "svelte3/svelte3",
      rules: {
        "import/first": 0,
        "import/no-duplicates": 0,
        "import/no-extraneous-dependencies": 0,
        "import/no-mutable-exports": 0,
        "import/order": 0,
        "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 2, maxEOF: 0 }], // maxBOF is to fix for files that lead with a script block
      },
    },
  ],
  settings: {
    "svelte3/ignore-styles": attributes =>
      attributes.lang && attributes.lang.includes("scss"),
    "import/resolver": {
      alias: {
        map: [["@sapper", "./src/node_modules/@sapper"]],
        extensions: [".js", ".ts", ".svelte"],
      },
      typescript: {}, // this loads <root_dir>/tsconfig.json to eslint
    },
  },
  rules: {
    // ENV Specific
    "@typescript-eslint/no-extra-semi": 0,
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_|req|res|next|args|ctx|__",
        varsIgnorePattern: "^_|req|res|next|args|ctx|__",
      },
    ],
    "graphql/template-strings": [
      "error",
      {
        env: "literal",
        tagName: "gql",
        schemaString,
      },
    ],
    // END

    camelcase: 0,
    "comma-dangle": ["error", "always-multiline"],
    "import/default": "error",
    "import/export": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "always",
        ts: "never", // Should be set to always. Prevented by Typescript error.
      },
    ],
    "import/first": "error",
    "import/named": "error",
    "import/namespace": "error",
    "import/newline-after-import": ["error", { count: 1 }],
    "import/no-anonymous-default-export": [
      2,
      {
        allowArray: true,
        allowObject: true,
      },
    ],
    "import/no-commonjs": 2,
    "import/no-cycle": [2, { ignoreExternal: true }],
    "import/no-deprecated": "error",
    "import/no-duplicates": "error",
    "import/no-extraneous-dependencies": "error",
    "import/no-internal-modules": 0,
    "import/no-mutable-exports": "error",
    "import/no-named-as-default-member": "error",
    "import/no-named-as-default": "error",
    "import/no-named-default": "error",
    "import/no-self-import": "error",
    "import/no-unresolved": [2, { ignore: ["@sapper"] }],
    "import/no-unused-modules": "error",
    "import/no-useless-path-segments": "error",
    "import/order": "error",
    indent: "off", // Fix conflict with Prettier
    "keyword-spacing": [
      "error",
      {
        after: true,
        before: true,
      },
    ],
    "linebreak-style": ["error", "unix"],
    "node/no-deprecated-api": [
      "error",
      {
        version: ">=14.0.0",
        ignoreModuleItems: [],
        ignoreGlobalItems: [],
      },
    ],
    "no-labels": "error",
    "no-multi-spaces": "error",
    "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
    "no-restricted-syntax": ["error", "LabeledStatement"],
    "no-self-assign": "error",
    "no-sequences": 0,
    "no-undef": "error",
    "no-unused-labels": "error",
    "no-unexpected-multiline": "error",
    "no-unreachable": "warn",
    "no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_|req|res|next|args|ctx|__",
        varsIgnorePattern: "^_|req|res|next|args|ctx|__",
      },
    ],
    "no-use-before-define": "error",
    "no-var": "error",
    "object-shorthand": ["error", "always"],
    "prefer-const": [
      "error",
      { destructuring: "all", ignoreReadBeforeAssign: true },
    ],
    semi: "error",
    "space-before-function-paren": [
      "error",
      {
        anonymous: "always",
        named: "never",
        asyncArrow: "always",
      },
    ],
    "spaced-comment": [
      "error",
      "always",
      {
        line: {
          markers: ["!", "?", "*"],
          exceptions: ["-", "*"],
        },
        block: {
          markers: ["!", "?", "*"],
          exceptions: ["-", "*"],
          balanced: true,
        },
      },
    ],
    quotes: [
      "error",
      "double",
      {
        avoidEscape: true,
      },
    ],
  },
}
