import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

import { loadHead } from './browser.js';

/**
 * Loads the app of a build, and returns:
 *
 * - `app`: an `Application` that does not boot itself
 * - `settled`: resolves when the app has no more work scheduled
 *
 * Two kinds of build:
 *
 * - `entry` is set: a Vite SSR bundle that exports `createSsrApp()`
 * - `entry` is not set: a classic (broccoli) build in `distPath`
 */
export async function loadApp({ distPath, entry }, window) {
  let html = await readFile(join(distPath, 'index.html'), 'utf8');

  loadHead(window.document, html);

  if (entry) {
    return fromModule(await import(pathToFileURL(entry).href), entry);
  }

  return loadClassicBuild(distPath, html, window);
}

/**
 * The SSR entry module of a Vite app.
 *
 *   export function createSsrApp() → an Application with autoboot: false
 *   export async function settled() → optional
 */
export function fromModule(module, entry) {
  if (typeof module.createSsrApp !== 'function') {
    throw new Error(
      `The SSR entry '${entry}' must export a function 'createSsrApp'. It exports: ${Object.keys(module).join(', ')}`,
    );
  }

  let app = module.createSsrApp();
  let settled = typeof module.settled === 'function' ? module.settled : nextTask;

  return { app, settled };
}

/**
 * Runs the scripts of a classic `index.html` in this realm, in document order,
 * the same way a browser does.
 *
 * `runningTests` is set after each script.
 * The app-boot code at the end of the app's script then does not boot the app.
 * Vendor code declares `var runningTests = false`, so this must happen after it.
 */
async function loadClassicBuild(distPath, html, window) {
  let parsed = new window.DOMParser().parseFromString(html, 'text/html');
  let configMeta = parsed.querySelector('meta[name$="/config/environment"]');
  let rootURL = configMeta ? (JSON.parse(decodeURIComponent(configMeta.content)).rootURL ?? '/') : '/';

  for (let script of parsed.querySelectorAll('script')) {
    let type = script.getAttribute('type');

    if (type && type !== 'text/javascript' && type !== 'application/javascript') continue;

    let src = script.getAttribute('src');

    if (src === null) {
      runInlineScript(script.textContent);
    } else if (!/^([a-z]+:)?\/\//i.test(src)) {
      let path = src.startsWith(rootURL) ? src.slice(rootURL.length) : src.replace(/^\//, '');
      let file = join(distPath, path.split(/[?#]/)[0]);

      vm.runInThisContext(await readFile(file, 'utf8'), { filename: file });
    }

    globalThis.runningTests = true;
  }

  let requireModule = globalThis.require;
  let modulePrefix = configMeta
    ? configMeta.getAttribute('name').replace(/\/config\/environment$/, '')
    : findModulePrefix();

  let Application = requireModule(`${modulePrefix}/app`).default;
  let config = requireModule(`${modulePrefix}/config/environment`).default;
  let runloop = requireModule('@ember/runloop');

  let app = Application.create({ ...config.APP, autoboot: false });

  return { app, settled: () => runLoopSettled(runloop) };
}

/**
 * Inline scripts run as they do in a browser.
 * An error in one does not stop the app from loading.
 */
function runInlineScript(source) {
  try {
    vm.runInThisContext(source);
  } catch (error) {
    console.warn('[fastboot] An inline script of index.html threw an error:', error);
  }
}

/**
 * The module prefix of an app that does not keep its config in a `<meta>` tag.
 */
function findModulePrefix() {
  let entries = globalThis.requirejs?.entries ?? {};

  for (let name of Object.keys(entries)) {
    let match = name.match(/^(.+)\/config\/environment$/);

    if (match && `${match[1]}/app` in entries) return match[1];
  }

  throw new Error('FastBoot did not find the app module of the build. Is this the dist directory of an Ember app?');
}

async function runLoopSettled(runloop) {
  await nextTask();

  while (runloop._getCurrentRunLoop() || runloop._hasScheduledTimers()) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function nextTask() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
