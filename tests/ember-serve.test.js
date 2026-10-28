import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { root, withoutMarkers } from './helpers.js';

function freePort() {
  return new Promise((resolve) => {
    let server = createServer();

    server.listen(0, '127.0.0.1', () => {
      let { port } = server.address();

      server.close(() => resolve(port));
    });
  });
}

describe('ember serve in a classic app', () => {
  let child;
  let origin;

  beforeAll(async () => {
    let port = await freePort();

    origin = `http://127.0.0.1:${port}`;
    let args = ['exec', 'ember', 'serve', '--port', String(port), '--live-reload', 'false'];

    /** The other tests use `dist`. */
    args.push('--output-path', 'tmp/serve-dist');

    child = spawn('pnpm', args, {
      cwd: join(root, 'test-packages/classic-app'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    await new Promise((resolve, reject) => {
      let output = '';

      child.stdout.on('data', (data) => {
        output += data;

        if (output.includes('Serving on')) resolve();
      });
      child.stderr.on('data', (data) => (output += data));
      child.on('exit', (code) => reject(new Error(`ember serve stopped with code ${code}:\n${output}`)));
    });
  });

  afterAll(() => child?.kill());

  test('pages are rendered by FastBoot', async () => {
    let response = await fetch(`${origin}/about`, { headers: { accept: 'text/html' } });

    expect(response.status).toBe(200);
    expect(withoutMarkers(await response.text())).toContain('<h1>About</h1>');
  });

  test('?fastboot=false gives the page without a render', async () => {
    let response = await fetch(`${origin}/about?fastboot=false`, { headers: { accept: 'text/html' } });
    let text = await response.text();

    expect(text).toContain('<!-- FASTBOOT_BODY -->');
    expect(text).not.toContain('<h1>About</h1>');
  });
});
