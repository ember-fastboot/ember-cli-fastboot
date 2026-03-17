module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
  plugins: ['prettier', 'node'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  overrides: [
    // override eslint in the dev/* folder to allow features from more recent
    // Node versions
    {
      files: ['dev/**/*.js'],
      rules: {
        'node/no-unsupported-features/node-builtins': [
          'error',
          {
            version: '>=10.0.0',
            ignores: [],
          },
        ],
      },
    },
  ],
};
