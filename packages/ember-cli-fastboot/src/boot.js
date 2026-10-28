/**
 * Starts the app in the browser.
 *
 * When the server rendered the page, the app takes over the rendered DOM
 * (rehydration) and does not render it again.
 * Otherwise, the app boots as usual.
 *
 * Classic builds put the source text of `boot` into the app's script,
 * so it must not use imports or outer variables.
 */
export function boot(Application, config) {
  let APP = config.APP || {};
  let root =
    typeof APP.rootElement === 'string' ? document.querySelector(APP.rootElement) : APP.rootElement || document.body;
  let rendered = false;

  for (let node = root && root.firstChild; node; node = node.nextSibling) {
    if (node.nodeType === 8 && node.nodeValue === '%+b:0%') {
      rendered = true;
      break;
    }
  }

  if (!rendered) {
    return Application.create(APP);
  }

  let app = Application.create(Object.assign({}, APP, { autoboot: false }));
  let rootURL = config.rootURL || '/';
  let url = location.pathname + location.search + location.hash;

  if (url.indexOf(rootURL) === 0) {
    url = '/' + url.slice(rootURL.length);
  }

  app.visit(url, { _renderMode: 'rehydrate' });

  return app;
}
