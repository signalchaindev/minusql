module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    allowImportExportEverywhere: true, // dynamic import
  },
  extends: ['standard', 'plugin:mocha/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    self: true,
    caches: true,
    fetch: true,
  },
  plugins: ['import', 'json', '@typescript-eslint', 'mocha'],
  settings: {
    'import/resolver': {
      typescript: {}, // this loads <rootdir>/tsconfig.json to eslint
    },
  },
  rules: {
    // ENV Specific
    '@typescript-eslint/no-extra-semi': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_|req|res|next|args|ctx|__',
        varsIgnorePattern: '^_|req|res|next|args|ctx|__',
      },
    ],
    'mocha/handle-done-callback': 'error',
    'mocha/no-mocha-arrows': 0,
    // END

    camelcase: 0,
    'comma-dangle': ['error', 'always-multiline'],
    'import/first': 2,
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'node/no-deprecated-api': [
      'error',
      {
        version: '>=10.0.0',
        ignoreModuleItems: [],
        ignoreGlobalItems: ['process.binding'],
      },
    ],
    'no-labels': 'error',
    'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0, maxEOF: 0 }],
    'no-restricted-syntax': ['error', 'LabeledStatement'],
    'no-self-assign': 'error',
    'no-sequences': 0,
    'no-undef': 'error',
    'no-unused-labels': 'error',
    'no-unexpected-multiline': 'error',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_|req|res|next|args|ctx|__',
        varsIgnorePattern: '^_|req|res|next|args|ctx|__',
      },
    ],
    'no-use-before-define': 'error',
    'no-var': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-const': [
      'error',
      { destructuring: 'all', ignoreReadBeforeAssign: true },
    ],
    'keyword-spacing': [
      'error',
      {
        after: true,
        before: true,
      },
    ],
    semi: 0,
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
  },
}
