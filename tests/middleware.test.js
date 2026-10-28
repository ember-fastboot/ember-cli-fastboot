import FastBoot from 'fastboot';
import fastbootMiddleware from 'fastboot/middleware';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { builds, serve, withoutMarkers } from './helpers.js';

describe('fastboot/middleware', () => {
  let fastboot;
  let strict;
  let resilient;

  beforeAll(async () => {
    fastboot = new FastBoot({ ...builds.classic, workers: 1, allowedHosts: [/^127\.0\.0\.1:\d+$/] });

    strict = await serve(
      builds.classic.distPath,
      fastbootMiddleware(fastboot, { metadata: () => ({ greeting: 'hi' }) }),
    );
    resilient = await serve(builds.classic.distPath, fastbootMiddleware(fastboot, { resilient: true }));
  });

  afterAll(async () => {
    await strict.close();
    await resilient.close();
    await fastboot.destroy();
  });

  test('a page request gets the rendered page', async () => {
    let response = await fetch(`${strict.origin}/about`);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(withoutMarkers(await response.text())).toContain('<h1>About</h1>');
  });

  test('the request, its cookies, and the metadata reach the app', async () => {
    let response = await fetch(`${strict.origin}/request?q=1`, {
      headers: { cookie: 'flavor=lemon', 'x-fixture': 'header value' },
    });
    let text = withoutMarkers(await response.text());

    expect(text).toContain('<dd id="cookie">lemon</dd>');
    expect(text).toContain('<dd id="header">header value</dd>');
    expect(text).toContain('<dd id="greeting">hi</dd>');
  });

  test('status codes and headers of the app are on the response', async () => {
    let response = await fetch(`${strict.origin}/teapot`);

    expect(response.status).toBe(418);
    expect(response.headers.get('x-teapot')).toBe('short and stout');
  });

  test('a redirect is a 307 with a Location header', async () => {
    let response = await fetch(`${strict.origin}/redirect`, { redirect: 'manual' });

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('/about');
  });

  test('a URL without a route goes to next()', async () => {
    let response = await fetch(`${strict.origin}/not-a-route`);

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('next()');
  });

  test('a failed render goes to next(error)', async () => {
    let response = await fetch(`${strict.origin}/broken`);

    expect(await response.text()).toBe('next(error): The broken route failed');
  });

  test('with resilient: true, a failed render sends the page for the browser to render', async () => {
    let response = await fetch(`${resilient.origin}/broken`);
    let text = await response.text();

    expect(response.status).toBe(500);
    expect(text).toContain('<script src="/assets/classic-app.js"></script>');
    expect(text).not.toContain('<main');
  });

  test('a HEAD request gets the headers without a body', async () => {
    let response = await fetch(`${strict.origin}/about`, { method: 'HEAD' });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('');
  });

  test('other methods go to next()', async () => {
    let response = await fetch(`${strict.origin}/about`, { method: 'POST' });

    expect(await response.text()).toBe('next()');
  });
});
