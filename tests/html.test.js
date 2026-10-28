import { describe, expect, test } from 'vitest';

import { emptyPage, insertIntoPage } from '../packages/fastboot/src/html.js';

const render = { head: '<meta name="a">', body: '<p>app</p>', htmlAttrs: {}, bodyAttrs: {} };

describe('insertIntoPage', () => {
  test('the markers are replaced', () => {
    let page =
      '<html><head><!-- FASTBOOT_HEAD --></head><body><div id="app"><!-- FASTBOOT_BODY --></div></body></html>';

    expect(insertIntoPage(page, render)).toBe(
      '<html><head><meta name="a"></head><body><div id="app"><p>app</p></div></body></html>',
    );
  });

  test('without markers, the head goes before </head> and the body after <body>', () => {
    let page = '<html><head><title>x</title></head><body class="b"><script src="/app.js"></script></body></html>';

    expect(insertIntoPage(page, render)).toBe(
      '<html><head><title>x</title><meta name="a"></head><body class="b"><p>app</p><script src="/app.js"></script></body></html>',
    );
  });

  test('a $ in the render stays as it is', () => {
    let page = '<head><!-- FASTBOOT_HEAD --></head><body><!-- FASTBOOT_BODY --></body>';

    expect(insertIntoPage(page, { ...render, body: "<p>$& $' $1</p>" })).toContain("<p>$& $' $1</p>");
  });

  test('a <title> in the render replaces the <title> of the page', () => {
    let page = '<head><title>Page</title><!-- FASTBOOT_HEAD --></head><body></body>';

    expect(insertIntoPage(page, { ...render, head: '<title>Render</title>' })).toBe(
      '<head><title>Render</title></head><body><p>app</p></body>',
    );
  });

  test('attributes are added to <html> and <body>, and classes are merged', () => {
    let page = '<html data-x="1"><head></head><body class="page" hidden></body></html>';
    let html = insertIntoPage(page, {
      ...render,
      htmlAttrs: { lang: 'en' },
      bodyAttrs: { class: 'theme-dark', 'data-theme': 'a "dark" one' },
    });

    expect(html).toContain('<html data-x="1" lang="en">');
    expect(html).toContain('<body class="page theme-dark" hidden data-theme="a &quot;dark&quot; one">');
  });
});

test('emptyPage removes the markers', () => {
  expect(emptyPage('<head><!-- FASTBOOT_HEAD --></head><body><!-- FASTBOOT_BODY --></body>')).toBe(
    '<head></head><body></body>',
  );
});
