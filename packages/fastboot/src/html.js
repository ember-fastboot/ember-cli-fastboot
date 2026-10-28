export const HEAD_MARKER = '<!-- FASTBOOT_HEAD -->';
export const BODY_MARKER = '<!-- FASTBOOT_BODY -->';

/**
 * Puts a render into the HTML page of the app.
 *
 * - head: at `<!-- FASTBOOT_HEAD -->`, else before `</head>`
 * - body: at `<!-- FASTBOOT_BODY -->`, else after `<body>`
 * - attributes of `<html>` and `<body>`: added to the tags of the page
 *
 * When the render has a `<title>`, the `<title>` of the page is removed.
 */
export function insertIntoPage(page, { head, body, htmlAttrs, bodyAttrs }) {
  let html = page;

  if (/<title[\s>]/i.test(head)) {
    html = html.replace(/<title[\s>][\s\S]*?<\/title>/i, '');
  }

  html = insertAt(html, HEAD_MARKER, head, /<\/head>/i, (tag) => head + tag);
  html = insertAt(html, BODY_MARKER, body, /<body\b[^>]*>/i, (tag) => tag + body);
  html = addAttributes(html, 'html', htmlAttrs);
  html = addAttributes(html, 'body', bodyAttrs);

  return html;
}

/**
 * The page without a render, for the browser to render.
 */
export function emptyPage(page) {
  return page.replace(HEAD_MARKER, '').replace(BODY_MARKER, '');
}

/**
 * Replacement functions keep `$` in the content as it is.
 */
function insertAt(html, marker, content, fallback, insert) {
  if (html.includes(marker)) {
    return html.replace(marker, () => content);
  }

  return html.replace(fallback, insert);
}

function addAttributes(html, tagName, attributes) {
  if (!attributes || Object.keys(attributes).length === 0) return html;

  let pattern = new RegExp(`<${tagName}\\b([^>]*)>`, 'i');

  return html.replace(pattern, (_tag, existing) => {
    let merged = parseAttributes(existing);

    for (let [name, value] of Object.entries(attributes)) {
      merged[name] = name === 'class' && merged.class ? `${merged.class} ${value}` : value;
    }

    let text = '';

    for (let [name, value] of Object.entries(merged)) {
      text += value === '' ? ` ${name}` : ` ${name}="${escapeAttribute(value)}"`;
    }

    return `<${tagName}${text}>`;
  });
}

function parseAttributes(text) {
  let attributes = {};
  let pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;

  for (let match of text.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = unescapeAttribute(match[2] ?? match[3] ?? match[4] ?? '');
  }

  return attributes;
}

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function unescapeAttribute(value) {
  return value.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
}
