import FastBoot from 'fastboot';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

import { builds, withoutMarkers } from './helpers.js';

describe.each(Object.entries(builds))('%s build', (_name, build) => {
  let fastboot;

  beforeAll(async () => {
    fastboot = new FastBoot({ ...build, workers: 2 });
    await fastboot.ready();
  });

  afterAll(() => fastboot.destroy());

  async function render(url, options) {
    let result = await fastboot.visit(url, options);

    return { result, html: result.html(), text: withoutMarkers(result.html()) };
  }

  test('a page renders with modifiers run and the global document', async () => {
    let { result, text } = await render('/');

    expect(result.statusCode).toBe(200);
    expect(text).toContain('<h1>Welcome</h1>');
    expect(text).toContain('<p id="location">/</p>');
    expect(text).toMatch(/<button id="counter" type="button" data-modifier="ran">\s*Clicked 0 times\s*<\/button>/);
  });

  test('the page title of the render replaces the title of index.html', async () => {
    let { text } = await render('/');

    expect(text).toContain('<title>Home | Fixture</title>');
    expect(text.match(/<title>/g)).toHaveLength(1);
  });

  test('the root element does not keep the class that the browser app adds', async () => {
    let { html } = await render('/');

    expect(html).not.toContain('ember-application');
  });

  test('the body keeps the serialization markers for rehydration', async () => {
    let { result } = await render('/');

    expect(result.domContents().body.startsWith('<!--%+b:0%-->')).toBe(true);
  });

  test('the result names the active routes', async () => {
    let { result } = await render('/about');

    expect(result.routeNames).toEqual(['application', 'about']);
  });

  test('a route that Embroider splits renders', async () => {
    let { result, text } = await render('/lazy');

    expect(text).toContain('<h1 class="lazy-title">Lazy</h1>');
    expect(result.routeNames).toEqual(['application', 'lazy']);
  });

  test('a redirect in a route becomes a 307 to the final URL', async () => {
    let { result, html } = await render('/redirect');

    expect(result.statusCode).toBe(307);
    expect(result.headers.get('location')).toBe('/about');
    expect(html).toContain('<a href="/about">/about</a>');
  });

  test('the status code and headers that the app sets on fastboot.response', async () => {
    let { result, text } = await render('/teapot');

    expect(result.statusCode).toBe(418);
    expect(result.headers.get('x-teapot')).toBe('short and stout');
    expect(text).toContain('<h1>I am a teapot</h1>');
  });

  test('fastboot.request and fastboot.metadata', async () => {
    let { text } = await render('/request?q=search', {
      request: {
        method: 'GET',
        url: '/request?q=search',
        headers: { cookie: 'flavor=mint; other=1', 'x-fixture': 'from the test' },
      },
      metadata: { greeting: 'hello' },
    });

    expect(text).toContain('<dd id="path">/request?q=search</dd>');
    expect(text).toContain('<dd id="method">GET</dd>');
    expect(text).toContain('<dd id="cookie">mint</dd>');
    expect(text).toContain('<dd id="header">from the test</dd>');
    expect(text).toContain('<dd id="query">search</dd>');
    expect(text).toContain('<dd id="greeting">hello</dd>');
  });

  test('fastboot.shoebox writes escaped JSON into the head', async () => {
    let { result, text } = await render('/shoebox');

    expect(text).toContain('<p id="answer">42</p>');
    expect(result.domContents().head).toContain(
      '<script type="fastboot/shoebox" id="shoebox-answer">{"answer":42,"html":"\\u003c/script\\u003e\\u003cb\\u003e"}</script>',
    );
  });

  test('the render waits for fastboot.deferRendering', async () => {
    let { text } = await render('/deferred');

    expect(text).toContain('<p id="deferred">deferred done</p>');
  });

  test('the render waits for async models and run loop timers', async () => {
    let { text } = await render('/slow');

    expect(text).toContain('<p id="model">slow model</p>');
    expect(text).toContain('<p id="later">later done</p>');
  });

  test('changes to <html>, <body>, and <head> are in the page', async () => {
    let { html } = await render('/document');

    expect(html).toMatch(/<html lang="en">/);
    expect(html).toMatch(/<body class="[^"]*\bfrom-app\b[^"]*">/);
    expect(html).toContain('<meta name="from-app" content="yes">');
  });

  test('a render starts from an empty document', async () => {
    await render('/document');

    let { html } = await render('/about');

    expect(html).not.toContain('lang="en"');
    expect(html).not.toContain('from-app');
  });

  test.runIf(_name === 'vite')('a page that uses WarpDrive renders', async () => {
    let { text } = await render('/store');

    expect(text).toContain('<p id="store">store ready</p>');
  });

  test('a failed render rejects', async () => {
    await expect(fastboot.visit('/broken')).rejects.toThrow('The broken route failed');
  });

  test('a failed render with resilient: true gives the page without rendered content', async () => {
    let { result, html } = await render('/broken', { resilient: true });

    expect(result.error.message).toBe('The broken route failed');
    expect(result.statusCode).toBe(500);
    expect(html).not.toContain('<main');
    expect(html).not.toContain('FASTBOOT_BODY');
  });

  test('a URL without a route is an UnrecognizedURLError with status 404', async () => {
    let { result } = await render('/not-a-route', { resilient: true });

    expect(result.error.name).toBe('UnrecognizedURLError');
    expect(result.statusCode).toBe(404);
  });

  test('renders at the same time do not mix', async () => {
    let urls = ['/', '/about', '/teapot', '/slow', '/deferred', '/document'];
    let expected = ['Welcome', 'About', 'I am a teapot', 'later done', 'deferred done', 'Document'];

    let results = await Promise.all(urls.map((url) => render(url)));

    for (let [index, { text }] of results.entries()) {
      expect(text).toContain(expected[index]);

      for (let [other, word] of expected.entries()) {
        if (other !== index) expect(text).not.toContain(word);
      }
    }
  });

  test('reload() loads the build again', async () => {
    await fastboot.reload();

    let { text } = await render('/about');

    expect(text).toContain('<h1>About</h1>');
  });
});

test('a build that does not load rejects ready() with the error', async () => {
  let fastboot = new FastBoot({ distPath: '/not/a/build', workers: 1 });

  await expect(fastboot.ready()).rejects.toThrow(/ENOENT/);
  await fastboot.destroy();
});
