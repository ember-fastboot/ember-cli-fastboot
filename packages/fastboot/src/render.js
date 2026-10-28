import { attributesOf, resetDocument } from './browser.js';
import { FastBootInfo, isAllowedHost } from './info.js';

/**
 * Renders one URL of a booted `Application` into the global document.
 *
 * Renders must not overlap: they share the document of the process or worker.
 *
 * The return value crosses a worker boundary,
 * so it holds only strings, numbers, and plain objects.
 */
export async function render({ app, settled, window, task, options }) {
  let { document } = window;
  let { url, request, metadata, responseHeaders } = task;

  let info = new FastBootInfo({
    request,
    metadata,
    responseHeaders,
    allowedHosts: options.allowedHosts,
  });

  let instance;
  let result = {
    rendered: false,
    head: '',
    body: '',
    htmlAttrs: {},
    bodyAttrs: {},
    shoebox: '',
    routeNames: [],
    statusCode: 200,
    headers: {},
  };

  resetDocument(document);
  window.happyDOM.setURL(new URL(url, originOf(request, options.allowedHosts)).href);

  try {
    await app.boot();

    instance = app.buildInstance();
    instance.register('info:-fastboot', info, { instantiate: false });

    await instance.boot({ rootElement: document.body, _renderMode: 'serialize' });
    await instance.visit(withoutRootURL(url, instance.lookup('router:main').rootURL));
    await info.settled();
    await waitFor(settled, options.settledTimeout);

    redirectIfMoved(instance, url, info.response, options.redirectCode);

    removeRootElementClass(document.body);

    result.rendered = true;
    result.head = document.head.innerHTML;
    result.body = document.body.innerHTML;
    result.htmlAttrs = attributesOf(document.documentElement);
    result.bodyAttrs = attributesOf(document.body);
    result.shoebox = shoeboxHTML(info.shoebox);
    result.routeNames = activeRouteNames(instance);
  } catch (error) {
    result.error = serializeError(error);
    info.response.statusCode = error?.name === 'UnrecognizedURLError' ? 404 : 500;
  } finally {
    try {
      instance?.destroy();
    } catch {
      /** The document reset below must run even when the teardown throws. */
    }

    resetDocument(document);
  }

  result.statusCode = info.response.statusCode;
  result.headers = info.response.headers.toJSON();

  return result;
}

/**
 * `visit()` takes a URL without the `rootURL` of the app:
 *
 *   '/blog/posts/1' with rootURL '/blog/' → '/posts/1'
 */
function withoutRootURL(url, rootURL = '/') {
  return url.startsWith(rootURL) ? `/${url.slice(rootURL.length)}` : url;
}

/**
 * The names of the active routes, from the top: `['application', 'blog', 'blog.post']`.
 */
function activeRouteNames(instance) {
  let names = [];

  for (let route = instance.lookup('service:router')?.currentRoute; route; route = route.parent) {
    names.unshift(route.name);
  }

  if (names[0] !== 'application') names.unshift('application');

  return names;
}

/**
 * The event dispatcher adds `ember-application` to the root element.
 * The app in the browser adds it again, and asserts that it is not there yet.
 */
function removeRootElementClass(element) {
  element.classList.remove('ember-application');

  if (element.classList.length === 0) element.removeAttribute('class');
}

/**
 * The origin of `window.location` during a render.
 *
 * The `Host` header is used only when it matches `allowedHosts`,
 * because code builds request URLs from `location`.
 */
function originOf(request, allowedHosts) {
  let host = request?.headers?.host;

  if (!isAllowedHost(host, allowedHosts)) return 'http://localhost';

  return `${request.protocol ?? 'http'}://${host}`;
}

/**
 * When a route redirects during the first render,
 * the server answers with a redirect to the final URL.
 *
 * An app that sets its own 3xx status keeps it.
 */
function redirectIfMoved(instance, url, response, redirectCode) {
  if (response.statusCode >= 300 && response.statusCode < 400) return;

  let router = instance.lookup('router:main');
  let currentURL = instance.lookup('service:router')?.currentURL;

  if (!router?.location || typeof currentURL !== 'string') return;

  let finalURL = router.location.formatURL(currentURL);

  if (normalize(finalURL) === normalize(url)) return;

  response.statusCode = redirectCode;
  response.headers.set('location', finalURL);
}

function normalize(url) {
  let parsed = new URL(url, 'http://localhost');

  parsed.searchParams.sort();

  return decodeURI(parsed.pathname.replace(/(.)\/$/, '$1') + parsed.search);
}

async function waitFor(settled, timeout) {
  let timer;

  let timedOut = new Promise((resolve) => {
    timer = setTimeout(() => resolve(true), timeout);
  });

  try {
    let didTimeOut = await Promise.race([settled().then(() => false), timedOut]);

    if (didTimeOut) {
      console.warn(`[fastboot] The app did not settle within ${timeout}ms. FastBoot sends the page as it is now.`);
    }
  } finally {
    clearTimeout(timer);
  }
}

const JSON_ESCAPE = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

/**
 * One script tag for each key of `fastboot.shoebox`.
 * The browser parses a key only when the app reads it.
 */
function shoeboxHTML(shoebox) {
  let html = '';

  for (let [key, value] of Object.entries(shoebox)) {
    let json = JSON.stringify(value).replace(/[\u2028\u2029&><]/g, (match) => JSON_ESCAPE[match]);

    html += `<script type="fastboot/shoebox" id="shoebox-${escapeAttribute(key)}">${json}</script>`;
  }

  return html;
}

function escapeAttribute(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function serializeError(error) {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }

  return { name: 'Error', message: String(error) };
}
