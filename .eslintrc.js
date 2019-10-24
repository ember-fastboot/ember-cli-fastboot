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
};
