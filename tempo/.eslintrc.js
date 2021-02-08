module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    allowImportExportEverywhere: true,
  },
  extends: ['standard'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    self: true,
    caches: true,
    fetch: true,
  },
  plugins: ['import', 'graphql', 'json'],
  rules: {
    camelcase: 0,
    'comma-dangle': ['error', 'always-multiline'],
    'import/first': 0,
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
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 0 }],
    'no-restricted-syntax': ['error', 'LabeledStatement'],
    'no-self-assign': 'error',
    'no-sequences': 0,
    'no-undef': 'error',
    'no-unused-labels': 'error',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_|req|res|next|args|ctx',
        varsIgnorePattern: '^_|req|res|next|args|ctx',
      },
    ],
    'no-use-before-define': 'error',
    'no-var': 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-const': 2,
    'keyword-spacing': [
      'error',
      {
        after: true,
        before: true,
      },
    ],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      },
    ],
    semi: 'error',
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
  },
}
