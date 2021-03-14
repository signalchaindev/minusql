/** @type {import('eslint').Linter.Config} */

/* eslint-disable import/no-commonjs */
module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    allowImportExportEverywhere: true, // dynamic import
  },
  extends: ["standard", "eslint:recommended", "plugin:mocha/recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    self: true,
    caches: true,
    fetch: true,
  },
  plugins: [
    "@typescript-eslint",
    "prettier",
    "node",
    "import",
    "json",
    "mocha",
  ],
  settings: {
    "import/resolver": {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
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
    "mocha/handle-done-callback": "error",
    "mocha/no-mocha-arrows": 0,
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
    "import/no-unresolved": "error",
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
    "prettier/prettier": [
      "error",
      {
        arrowParens: "avoid",
        bracketSpacing: true,
        endOfLine: "lf",
        printWidth: 80,
        semi: false,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "all",
        useTabs: false,
      },
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
