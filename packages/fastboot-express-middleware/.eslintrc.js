'use strict';
module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
  plugins: ['node', 'prettier'],
  env: {
    node: true,
    es6: true,
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        "endOfLine": "auto"
      },
    ],
  },
  overrides: [
    {
      files: ['test/**/*-test.js'],
      env: {
        mocha: true,
      },
      extends: ['plugin:mocha/recommended'],
      plugins: ['mocha'],
    },
  ],
};
