module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    allowImportExportEverywhere: true, // dynamic import
  },
  extends: ['standard'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    self: true,
    caches: true,
    fetch: true,
  },
  plugins: ['svelte3', 'graphql', 'json'],
  overrides: [
    {
      files: ['**/*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
  settings: {
    'svelte3/ignore-styles': attributes =>
      attributes.lang && attributes.lang.includes('scss'),
    // 'svelte3/ignore-warnings': ({ code }) => code === 'missing-declaration',
  },
  rules: {
    camelcase: 0,
    'comma-dangle': ['error', 'always-multiline'],
    'import/first': 1,
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
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
    'no-restricted-syntax': ['error', 'LabeledStatement'],
    'no-self-assign': 'error',
    'no-sequences': 0,
    'no-undef': 'error',
    'no-unused-labels': 'error',
    'no-unexpected-multiline': 'error',
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
    semi: 'error',
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
