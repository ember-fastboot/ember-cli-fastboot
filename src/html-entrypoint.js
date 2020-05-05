'use strict';

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');

function htmlEntrypoint(distPath, htmlPath) {
  let html = fs.readFileSync(path.join(distPath, htmlPath), 'utf8');
  let dom = new JSDOM(html);
  let scripts = [];

  let config = {};
  for (let element of dom.window.document.querySelectorAll('meta')) {
    let name = element.getAttribute('name');
    if (name && name.endsWith('/config/environment')) {
      let content = JSON.parse(decodeURIComponent(element.getAttribute('content')));
      content.APP = Object.assign({ autoboot: false }, content.APP);
      config[name.slice(0, -1 * '/config/environment'.length)] = content;
    }
  }

  for (let element of dom.window.document.querySelectorAll('script,fastboot-script')) {
    let src = extractSrc(element);
    let ignored = extractIgnore(element);
    if (!ignored && isRelativeURL(src)) {
      scripts.push(path.join(distPath, src));
    }
    if (element.tagName === 'FASTBOOT-SCRIPT') {
      removeWithWhitespaceTrim(element);
    }
  }

  return { config, html: dom.serialize(), scripts };
}

function extractSrc(element) {
  if (element.hasAttribute('data-fastboot-src')) {
    let src = element.getAttribute('data-fastboot-src');
    element.removeAttribute('data-fastboot-src');
    return src;
  } else {
    return element.getAttribute('src');
  }
}

function extractIgnore(element) {
  if (element.hasAttribute('data-fastboot-ignore')) {
    element.removeAttribute('data-fastboot-ignore');
    return true;
  }
  return false;
}

function isRelativeURL(url) {
  return (
    url && new URL(url, 'http://_the_current_origin_').origin === 'http://_the_current_origin_'
  );
}

// removes an element, and if that element was on a line by itself with nothing
// but whitespace, removes the whole line. The extra whitespace would otherwise
// be harmless but ugly.
function removeWithWhitespaceTrim(element) {
  let prev = element.previousSibling;
  let next = element.nextSibling;
  if (prev && next && prev.nodeType == prev.TEXT_NODE && next.nodeType === next.TEXT_NODE) {
    let prevMatch = prev.textContent.match(/\n\s*$/);
    let nextMatch = next.textContent.match(/^(\s*\n)/);
    if (prevMatch && nextMatch) {
      prev.textContent = prev.textContent.slice(0, prevMatch.index + 1);
      next.textContent = next.textContent.slice(nextMatch[0].length);
    }
  }
  element.remove();
}

module.exports = htmlEntrypoint;
