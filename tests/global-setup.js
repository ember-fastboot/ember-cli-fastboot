import { execFileSync } from 'node:child_process';

import { root } from './helpers.js';

/**
 * Builds both fixture apps once for the whole run.
 * Set `SKIP_FIXTURE_BUILD=true` to test the builds that are already on disk.
 */
export default function setup() {
  if (process.env.SKIP_FIXTURE_BUILD === 'true') return;

  execFileSync('pnpm', ['build:fixtures'], { cwd: root, stdio: 'inherit' });
}
