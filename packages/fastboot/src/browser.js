import { GlobalRegistrator } from '@happy-dom/global-registrator';

/**
 * Makes this realm a browser window, with happy-dom:
 * `window === globalThis`, and `document`, `location`, `Node`, ... are globals.
 *
 * Classic scripts need `window === globalThis`:
 * they set `window.x` and then read `x` as a global.
 *
 * With `globalThis.constructor === Window`, Ember's own environment check
 * sees a browser:
 *
 *   isBrowser → true
 *   isInteractive → true
 *   document → the global document
 *
 * So the renderer needs no boot flags.
 *
 * Call it once per realm, before the app's modules evaluate,
 * because modules can read `document` at the top level.
 */
export function installBrowser() {
  if (!GlobalRegistrator.isRegistered) {
    GlobalRegistrator.register({
      url: 'http://localhost/',
      settings: {
        disableJavaScriptFileLoading: true,
        disableJavaScriptEvaluation: true,
        disableCSSFileLoading: true,
        disableIframePageLoading: true,
        handleDisabledFileLoadingAsSuccess: true,
        navigator: { userAgent: 'FastBoot' },
      },
    });

    Object.defineProperty(globalThis, 'constructor', {
      value: globalThis.Window,
      writable: true,
      configurable: true,
    });
  }

  return globalThis;
}

/**
 * Puts the head of an HTML page into the document, and empties the body.
 *
 * Config modules read `<meta>` tags from the head when they evaluate,
 * so the head of `index.html` must be there before the app loads.
 */
export function loadHead(document, html) {
  let parsed = new document.defaultView.DOMParser().parseFromString(html, 'text/html');

  document.head.innerHTML = parsed.head.innerHTML;
  document.body.innerHTML = '';
}

/**
 * Removes everything that a render left in the document:
 *
 * - nodes in `<head>` and `<body>`
 * - attributes on `<html>` and `<body>`
 */
export function resetDocument(document) {
  document.head.innerHTML = '';
  document.body.innerHTML = '';

  for (let element of [document.documentElement, document.body]) {
    while (element.attributes.length > 0) {
      element.removeAttribute(element.attributes[0].name);
    }
  }
}

export function attributesOf(element) {
  let result = {};

  for (let i = 0; i < element.attributes.length; i++) {
    let attribute = element.attributes[i];

    result[attribute.name] = attribute.value;
  }

  return result;
}
