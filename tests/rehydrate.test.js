import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import FastBoot from 'fastboot';
import fastbootMiddleware from 'fastboot/middleware';
import { chromium } from 'playwright';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { builds, serve } from './helpers.js';

/**
 * Runs before any script of the page:
 *
 * - keeps the first `#counter` element that the HTML parser creates
 * - counts the loads of the shoebox route that did not use the shoebox
 */
const BEFORE_PAGE_SCRIPTS = `
  window.answerLoads = 0;

  new MutationObserver(() => {
    window.serverButton ??= document.getElementById('counter');
  }).observe(document, { childList: true, subtree: true });
`;

describe.each(Object.entries(builds))('%s build in a browser', (_name, build) => {
  let fastboot;
  let server;
  let browser;
  let browserPage;
  let errors;

  beforeAll(async () => {
    fastboot = new FastBoot({ ...build, workers: 1 });
    server = await serve(build.distPath, fastbootMiddleware(fastboot));
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser?.close();
    await server?.close();
    await fastboot?.destroy();
  });

  async function open(url, origin = server.origin) {
    errors = [];
    browserPage = await browser.newPage();
    browserPage.on('pageerror', (error) => errors.push(error.message));
    browserPage.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    await browserPage.addInitScript(BEFORE_PAGE_SCRIPTS);
    await browserPage.goto(`${origin}${url}`);
  }

  async function clickUntilCounted() {
    await expect
      .poll(
        async () => {
          await browserPage.click('#counter');

          return browserPage.textContent('#counter');
        },
        { timeout: 10_000 },
      )
      .toMatch(/Clicked [1-9]\d* times/);
  }

  test('the app takes over the rendered DOM and does not render it again', async () => {
    await open('/');

    await clickUntilCounted();

    expect(await browserPage.locator('#counter').count()).toBe(1);
    expect(await browserPage.evaluate(() => document.getElementById('counter') === window.serverButton)).toBe(true);
    expect(await browserPage.locator('h1').count()).toBe(1);
    expect(errors).toEqual([]);

    await browserPage.close();
  });

  test('the shoebox value is read in the browser', async () => {
    await open('/shoebox');

    await expect.poll(() => browserPage.locator('#answer').count()).toBe(1);
    await browserPage.waitForFunction(() => !document.body.innerHTML.includes('%+b:0%'));

    expect(await browserPage.textContent('#answer')).toBe('42');
    expect(await browserPage.evaluate(() => window.answerLoads)).toBe(0);
    expect(errors).toEqual([]);

    await browserPage.close();
  });

  test('a page that the server did not render boots as usual', async () => {
    let page = await readFile(join(build.distPath, 'index.html'), 'utf8');
    let plain = await serve(build.distPath, (_req, res) => {
      res.setHeader('content-type', 'text/html; charset=utf-8');
      res.end(page);
    });

    try {
      await open('/', plain.origin);

      await clickUntilCounted();
      expect(await browserPage.locator('#counter').count()).toBe(1);
      expect(errors).toEqual([]);
    } finally {
      await browserPage.close();
      await plain.close();
    }
  });
});
