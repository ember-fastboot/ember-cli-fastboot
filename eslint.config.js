import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['**/dist/', '**/tmp/', 'test-packages/', 'patches/'] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    files: ['packages/ember-cli-fastboot/src/**/*.js', 'tests/rehydrate.test.js', 'tests/prerender.test.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['**/*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
  },
];
