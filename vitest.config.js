import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    globalSetup: ['tests/global-setup.js'],
    testTimeout: 60_000,
    hookTimeout: 180_000,
  },
});
