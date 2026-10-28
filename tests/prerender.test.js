import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { prerender } from 'fastboot/prerender';
import { chromium } from 'playwright';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { builds, root, serve, withoutMarkers } from './helpers.js';

/** The output of `vite build --config vite.config.ssg.mjs` in the Vite fixture. */
const staticDir = join(root, 'test-packages/vite-app/dist/static');

describe('the prerender option of the Vite plugin', () => {
  test('writes a page for each route', async () => {
    let index = await readFile(join(staticDir, 'index.html'), 'utf8');
    let about = withoutMarkers(await readFile(join(staticDir, 'about/index.html'), 'utf8'));
    let shoebox = await readFile(join(staticDir, 'shoebox/index.html'), 'utf8');

    expect(index).toContain('<!--%+b:0%-->');
    expect(withoutMarkers(index)).toContain('<h1>Welcome</h1>');
    expect(about).toContain('<h1>About</h1>');
    expect(shoebox).toContain('id="shoebox-answer"');
  });

  test('a page links the stylesheets of its lazy routes, and only those', async () => {
    let lazy = await readFile(join(staticDir, 'lazy/index.html'), 'utf8');
    let about = await readFile(join(staticDir, 'about/index.html'), 'utf8');

    expect(lazy).toMatch(
      /<link rel="stylesheet" crossorigin href="\/assets\/-embroider-route-entrypoint-[\w-]+\.css">/,
    );
    expect(about).not.toContain('-embroider-route-entrypoint-');
  });

  test('the build keeps no manifest that the plugin added', async () => {
    await expect(stat(join(staticDir, '.vite'))).rejects.toThrow('ENOENT');
  });

  describe('in a browser', () => {
    let server;
    let browser;

    beforeAll(async () => {
      /** A static file server: `/about` is `about/index.html`. */
      server = await serve(staticDir, async (req, res, next) => {
        try {
          let page = await readFile(join(staticDir, req.url.split('?')[0], 'index.html'));

          res.setHeader('content-type', 'text/html; charset=utf-8');
          res.end(page);
        } catch {
          next();
        }
      });
      browser = await chromium.launch();
    });

    afterAll(async () => {
      await browser?.close();
      await server?.close();
    });

    test('a page has the styles of its lazy route before JavaScript runs', async () => {
      let context = await browser.newContext({ javaScriptEnabled: false });
      let page = await context.newPage();

      await page.goto(`${server.origin}/lazy`);

      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.lazy-title')).color)).toBe(
        'rgb(0, 128, 0)',
      );

      await context.close();
    });

    test('the app takes over a prerendered page', async () => {
      let errors = [];
      let page = await browser.newPage();

      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });

      await page.addInitScript(`
        window.answerLoads = 0;

        new MutationObserver(() => {
          window.serverButton ??= document.getElementById('counter');
        }).observe(document, { childList: true, subtree: true });
      `);

      await page.goto(`${server.origin}/`);

      await expect
        .poll(
          async () => {
            await page.click('#counter');

            return page.textContent('#counter');
          },
          { timeout: 10_000 },
        )
        .toMatch(/Clicked [1-9]\d* times/);

      expect(await page.locator('#counter').count()).toBe(1);
      expect(await page.evaluate(() => document.getElementById('counter') === window.serverButton)).toBe(true);

      await page.goto(`${server.origin}/shoebox`);
      await page.waitForFunction(() => !document.body.innerHTML.includes('%+b:0%'));

      expect(await page.textContent('#answer')).toBe('42');
      expect(await page.evaluate(() => window.answerLoads)).toBe(0);
      expect(errors).toEqual([]);

      await page.close();
    });
  });
});

describe('prerender()', () => {
  let outDir;

  beforeAll(async () => {
    outDir = await mkdtemp(join(tmpdir(), 'fastboot-prerender-'));
  });

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true });
  });

  test('writes the pages of a classic build', async () => {
    let pages = await prerender({ ...builds.classic, outDir, workers: 1, routes: ['/', 'about', '/redirect'] });

    expect(pages.map(({ url, statusCode }) => [url, statusCode])).toEqual([
      ['/', 200],
      ['/about', 200],
      ['/redirect', 307],
    ]);

    expect(withoutMarkers(await readFile(join(outDir, 'about/index.html'), 'utf8'))).toContain('<h1>About</h1>');
    expect(await readFile(join(outDir, 'redirect/index.html'), 'utf8')).toContain('Redirecting to');
  });

  test('rejects when a page fails', async () => {
    let failure = prerender({ ...builds.classic, outDir, workers: 1, routes: ['/about', '/broken', '/nope'] });

    await expect(failure).rejects.toThrow('FastBoot could not prerender 2 of 3 pages');
    await expect(failure).rejects.toSatisfy(
      ({ errors }) => errors.map(({ message }) => message.split(':')[0]).join() === '/broken,/nope',
    );
  });
});
