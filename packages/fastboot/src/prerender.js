import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

import FastBoot from './index.js';

/**
 * Renders a list of URLs at build time,
 * and writes each page as `<outDir>/<url>/index.html`.
 *
 * A static file server then serves each page as it is,
 * and the app in the browser takes over the page (rehydration).
 *
 * @param {object} options
 * @param {string[]} options.routes the URLs to render, for example `['/', '/about']`
 * @param {string} options.distPath the directory of the build
 * @param {string} [options.entry] the SSR bundle of a Vite build
 * @param {string} [options.template] the HTML file in `distPath` to render into; the default is `index.html`
 * @param {string} [options.outDir] the directory for the pages; the default is `distPath`
 * @param {(html: string, page: { url: string, result: import('./result.js').Result }) => string} [options.transformHtml]
 *   changes the HTML of a page before it is written
 * @returns {Promise<Array<{ url: string, file: string, statusCode: number }>>}
 */
export async function prerender(options) {
  let {
    routes,
    distPath,
    entry,
    template = 'index.html',
    outDir = distPath,
    transformHtml = (page) => page,
    ...fastbootOptions
  } = options;

  /**
   * Read the template before the first page is written:
   * the page of `/` replaces `index.html`.
   */
  let html = await readFile(join(distPath, template), 'utf8');
  let fastboot = new FastBoot({ ...fastbootOptions, distPath, entry, resilient: true });
  let failures = [];
  let pages = [];

  try {
    let results = await Promise.all(
      routes.map(async (route) => {
        let url = `/${route.replace(/^\//, '')}`;

        return { url, result: await fastboot.visit(url, { html }) };
      }),
    );

    for (let { url, result } of results) {
      if (result.error || result.statusCode >= 400) {
        failures.push(
          new Error(`${url}: ${result.error?.message ?? `status ${result.statusCode}`}`, { cause: result.error }),
        );
        continue;
      }

      let file = resolve(outDir, `.${url.split('?')[0]}`, 'index.html');

      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, transformHtml(result.html(), { url, result }));

      pages.push({ url, file, statusCode: result.statusCode });
    }
  } finally {
    await fastboot.destroy();
  }

  if (failures.length > 0) {
    throw new AggregateError(failures, `FastBoot could not prerender ${failures.length} of ${routes.length} pages`);
  }

  return pages;
}
