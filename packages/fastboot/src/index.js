import { readFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import { join, resolve } from 'node:path';

import { installBrowser, loadHead } from './browser.js';
import { fromModule } from './load.js';
import { WorkerPool } from './pool.js';
import { render } from './render.js';
import { Result } from './result.js';

export { Result };

/**
 * Renders the pages of an Ember app in Node.js.
 *
 * The app runs with a DOM (happy-dom), the same way it runs in a browser:
 * modifiers run, and `document` and `window` exist.
 *
 * Three sources of the app:
 *
 * - a classic build:     new FastBoot({ distPath: 'dist' })
 * - a Vite SSR build:    new FastBoot({ distPath: 'dist/client', entry: 'dist/server/app-ssr.js' })
 * - a Vite dev server:   new FastBoot({ vite: server, entry: '/app/app-ssr.js' })
 */
export default class FastBoot {
  #source;
  #runner;
  #options;
  #page;

  constructor(options = {}) {
    let { distPath, entry, vite, resilient = false, workers, template = 'index.html' } = options;

    if (!vite && !distPath) {
      throw new Error('FastBoot needs the `distPath` option (the directory of the build), or the `vite` option.');
    }

    if (vite && !entry) {
      throw new Error('FastBoot needs the `entry` option (the SSR entry module) with the `vite` option.');
    }

    this.resilient = resilient;

    this.#options = {
      allowedHosts: options.allowedHosts,
      settledTimeout: options.settledTimeout ?? 10_000,
      redirectCode: options.redirectCode ?? 307,
    };

    this.#source = { distPath, entry, vite, template, workers: workers ?? availableParallelism() };
    this.#start();
  }

  /**
   * Renders the app at a URL.
   *
   * @param {string} url the path and query of the page, for example `/photos/1?page=2`
   * @param {object} [options]
   * @param {import('node:http').IncomingMessage} [options.request] the request, for `fastboot.request`
   * @param {import('node:http').ServerResponse} [options.response] the response, for its initial headers
   * @param {object} [options.metadata] data for `fastboot.metadata`; it must survive `structuredClone`
   * @param {string} [options.html] the HTML page to render into; the default is the `template` of the build
   * @param {boolean} [options.resilient] when true, a failed render resolves with `result.error` set
   * @returns {Promise<Result>}
   */
  async visit(url, options = {}) {
    let task = {
      url,
      request: options.request ? requestData(options.request, url) : undefined,
      metadata: options.metadata,
      responseHeaders: options.response?.getHeaders?.() ?? {},
    };

    let page = options.html ?? (await this.#pageFor(url));
    let rendered = await this.#runner.run(task, page);
    let result = new Result(rendered, page);
    let resilient = options.resilient ?? this.resilient;

    if (result.error && !resilient) throw result.error;

    return result;
  }

  /**
   * Loads the build again, for example after a deploy or a rebuild.
   * Renders that already started finish with the old build.
   */
  async reload({ distPath, entry } = {}) {
    let old = this.#runner;

    if (distPath) this.#source.distPath = distPath;
    if (entry) this.#source.entry = entry;

    this.#start();
    await old.destroy();
  }

  /**
   * Resolves when the app is loaded and can render.
   * Rejects when the app does not load.
   */
  ready() {
    return this.#runner.ready();
  }

  destroy() {
    return this.#runner.destroy();
  }

  #start() {
    let { distPath, entry, vite, workers } = this.#source;

    this.#page = undefined;

    if (vite) {
      this.#runner = new DevRunner({ vite, entry, options: this.#options });
      return;
    }

    this.#runner = new WorkerPool({
      size: workers,
      workerData: {
        build: { distPath: resolve(distPath), entry: entry && resolve(entry) },
        options: this.#options,
      },
    });
  }

  async #pageFor(url) {
    let { distPath, vite, template } = this.#source;

    if (vite) {
      let source = await readFile(join(vite.config.root, template), 'utf8');

      /** The same arguments as the HTML middleware of Vite: the file, then the URL of the page. */
      return vite.transformIndexHtml(`/${template}`, source, url);
    }

    this.#page ??= readFile(join(distPath, template), 'utf8');

    return this.#page;
  }
}

/**
 * Renders in this process with the module graph of the Vite dev server,
 * so every render uses the current source files.
 *
 * The browser globals go on `globalThis` of the dev server process.
 */
class DevRunner {
  #vite;
  #entry;
  #options;
  #window;
  #module;
  #loaded;
  #queue = Promise.resolve();

  constructor({ vite, entry, options }) {
    this.#vite = vite;
    this.#entry = entry;
    this.#options = options;
  }

  run(task, page) {
    let run = this.#queue.then(() => this.#render(task, page));

    this.#queue = run.catch(() => {});

    return run;
  }

  async #render(task, page) {
    this.#window ??= installBrowser();

    loadHead(this.#window.document, page);

    let module = await this.#vite.ssrLoadModule(this.#entry);

    if (module !== this.#module) {
      this.#loaded?.app.destroy();
      this.#loaded = fromModule(module, this.#entry);
      this.#module = module;
    }

    return render({ ...this.#loaded, window: this.#window, task, options: this.#options });
  }

  async ready() {}

  async destroy() {
    await this.#queue;
    this.#loaded?.app.destroy();
  }
}

/**
 * The parts of a Node.js request that the app can read.
 * The worker gets a copy, so every value must survive `structuredClone`.
 */
function requestData(request, url) {
  let headers = {};

  for (let [name, value] of Object.entries(request.headers ?? {})) {
    if (value !== undefined) headers[name.toLowerCase()] = value;
  }

  let body;

  try {
    body = request.body === undefined ? undefined : structuredClone(request.body);
  } catch {
    body = undefined;
  }

  return {
    method: request.method ?? 'GET',
    url: request.originalUrl ?? request.url ?? url,
    protocol: request.protocol ?? (request.socket?.encrypted ? 'https' : 'http'),
    headers,
    body,
  };
}
