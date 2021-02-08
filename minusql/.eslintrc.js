module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
    mocha: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2019,
    sourceType: 'module',
    allowImportExportEverywhere: true,
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
    '@typescript-eslint/no-extra-semi': 0,
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_|req|res|next|args|ctx|__',
        varsIgnorePattern: '^_|req|res|next|args|ctx|__',
      },
    ],
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_|req|res|next|args|ctx|__',
        varsIgnorePattern: '^_|req|res|next|args|ctx|__',
      },
    ],
    camelcase: 0,
    'comma-dangle': ['error', 'always-multiline'],
    'import/first': 0,
    indent: ['error', 2, { SwitchCase: 1 }],
    'linebreak-style': ['error', 'unix'],
    'mocha/handle-done-callback': 'error',
    'mocha/no-mocha-arrows': 0,
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
    'no-unexpected-multiline': 1,
    'no-unused-labels': 'error',
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
    semi: 0,
    quotes: [
      'error',
      'single',
      {
        avoidEscape: true,
      },
    ],
  },
}
