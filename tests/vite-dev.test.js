import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { createServer } from 'vite';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { root, withoutMarkers } from './helpers.js';

const appRoot = join(root, 'test-packages/vite-app');

describe('fastboot/vite in the dev server', () => {
  let server;
  let origin;
  let cwd = process.cwd();

  /** The Ember build of the dev server runs in the current directory. */
  beforeAll(async () => {
    process.chdir(appRoot);
    server = await createServer({ root: appRoot, logLevel: 'silent', server: { port: 0, host: '127.0.0.1' } });
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  });

  afterAll(async () => {
    await server?.close();
    process.chdir(cwd);
  });

  function page(url) {
    return fetch(`${origin}${url}`, { headers: { accept: 'text/html' }, redirect: 'manual' });
  }

  test('a page is rendered on the server', async () => {
    let response = await page('/');
    let text = withoutMarkers(await response.text());

    expect(response.status).toBe(200);
    expect(text).toContain('<h1>Welcome</h1>');
    expect(text).toContain('data-modifier="ran"');
    expect(text).toContain('/@vite/client');
  });

  test('a page that uses WarpDrive renders', async () => {
    let response = await page('/store');

    expect(withoutMarkers(await response.text())).toContain('<p id="store">store ready</p>');
  });

  test('a redirect is a 307', async () => {
    let response = await page('/redirect');

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('/about');
  });

  test('a URL without a route gets the page of Vite, for the browser to render', async () => {
    let response = await page('/not-a-route');
    let text = await response.text();

    expect(response.status).toBe(200);
    expect(text).not.toContain('<main');
  });

  test('a failed render shows the error page of Vite', async () => {
    let response = await page('/broken');

    expect(response.status).toBe(500);
    expect(await response.text()).toContain('The broken route failed');
  });

  test('a render uses the current source files', async () => {
    let file = join(appRoot, 'app/templates/about.gjs');
    let source = await readFile(file, 'utf8');

    try {
      await writeFile(file, source.replace('<h1>About</h1>', '<h1>About, after an edit</h1>'));

      await expect
        .poll(async () => withoutMarkers(await (await page('/about')).text()), { timeout: 20_000 })
        .toContain('<h1>About, after an edit</h1>');
    } finally {
      await writeFile(file, source);
    }
  });
});

describe('fastboot/vite with prerender in the dev server', () => {
  let server;
  let origin;
  let cwd = process.cwd();

  beforeAll(async () => {
    process.chdir(appRoot);
    server = await createServer({
      root: appRoot,
      configFile: join(appRoot, 'vite.config.ssg.mjs'),
      logLevel: 'silent',
      server: { port: 0, host: '127.0.0.1' },
    });
    await server.listen();
    origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  });

  afterAll(async () => {
    await server?.close();
    process.chdir(cwd);
  });

  function page(url) {
    return fetch(`${origin}${url}`, { headers: { accept: 'text/html' } });
  }

  test('a page in the prerender routes is rendered, as in the build', async () => {
    let text = withoutMarkers(await (await page('/about')).text());

    expect(text).toContain('<h1>About</h1>');
  });

  test('a page that is not in the prerender routes is not rendered', async () => {
    let text = await (await page('/teapot')).text();

    expect(text).toContain('/@vite/client');
    expect(text).not.toContain('<!--%+b:0%-->');
  });
});
