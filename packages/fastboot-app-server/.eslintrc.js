'use strict';
module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  plugins: ['node'],
  env: {
    node: true,
    es6: true,
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
  ]
};