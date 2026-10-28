import { mkdtemp, readdir, readFile, rm, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';

import FastBoot from './index.js';
import fastbootMiddleware from './middleware.js';
import { prerender } from './prerender.js';

/**
 * Vite plugin for FastBoot.
 *
 * - `vite` (dev): pages are rendered on the server from the current source files.
 * - `vite build --ssr <entry>`: builds the SSR bundle for `new FastBoot({ entry })`.
 * - `vite build` with `prerender`: writes a static page for each route (SSG).
 *
 * @param {object} [options]
 * @param {string} [options.entry] the SSR entry module; the default is `app/app-ssr.js`
 * @param {Array<string | RegExp>} [options.allowedHosts] hosts that `fastboot.request.host` accepts
 * @param {number} [options.settledTimeout] milliseconds to wait for the app to settle
 * @param {object} [options.prerender] the pages to write at build time
 * @param {string[]} options.prerender.routes the URLs of the pages
 * @param {string} [options.prerender.template] the built HTML file to render into; the default is `index.html`
 * @param {(source: string) => string | undefined} [options.prerender.routeName] the route of a source module, for its stylesheets
 */
export function fastboot(options = {}) {
  let { entry = 'app/app-ssr.js', prerender: prerenderOptions, ...fastbootOptions } = options;
  let command;
  let resolvedConfig;
  let ownManifest = false;
  let written = false;

  return {
    name: 'fastboot',

    /**
     * The SSR bundle includes every dependency.
     * Node cannot resolve the module names that the Ember build resolves,
     * for example `@ember/application`.
     */
    config(config, env) {
      command = env.command;

      /**
       * The prerender reads the manifest of the client build
       * to find the stylesheets of lazy routes.
       */
      if (prerenderOptions && command === 'build' && !env.isSsrBuild && !config.build?.manifest) {
        ownManifest = true;

        return { ssr: { noExternal: true }, build: { manifest: true } };
      }

      return { ssr: { noExternal: true } };
    },

    configResolved(config) {
      resolvedConfig = config;
    },

    /**
     * After the client build: build the SSR bundle into a temporary directory,
     * render each route with it, and remove it.
     *
     * The SSR build loads the same config file, and this hook skips it there (`build.ssr` is set).
     */
    /**
     * Vite also calls `closeBundle` after a failed build.
     * The prerender runs only after the files are written, so that the build error stays visible.
     */
    writeBundle() {
      written = true;
    },

    closeBundle: {
      order: 'post',
      sequential: true,
      async handler() {
        if (!prerenderOptions || !written || command !== 'build' || resolvedConfig.build.ssr) return;

        let config = resolvedConfig;
        let distPath = resolve(config.root, config.build.outDir);
        /** Not in `node_modules`: there, the SSR build leaves app modules unresolved. */
        let serverDir = await mkdtemp(join(tmpdir(), 'fastboot-ssr-'));

        try {
          await buildServer(config, entry, serverDir);

          let manifestFile = join(
            distPath,
            typeof config.build.manifest === 'string' ? config.build.manifest : '.vite/manifest.json',
          );
          let stylesheets = routeStylesheets(
            JSON.parse(await readFile(manifestFile, 'utf8')),
            prerenderOptions.routeName ?? defaultRouteName,
          );

          if (ownManifest) {
            await rm(manifestFile);
            await rmdir(dirname(manifestFile)).catch(() => {});
          }

          let pages = await prerender({
            ...fastbootOptions,
            ...prerenderOptions,
            distPath,
            entry: join(serverDir, await entryFile(serverDir, entry)),
            transformHtml(html, { result }) {
              let links = result.routeNames
                .flatMap((name) => stylesheets.get(name) ?? [])
                .map((file) => `${config.base}${file}`)
                .filter((href, index, all) => all.indexOf(href) === index && !html.includes(`href="${href}"`))
                .map((href) => `<link rel="stylesheet" crossorigin href="${href}">`);

              return html.replace('</head>', `${links.join('\n')}\n</head>`);
            },
          });

          config.logger.info(`fastboot: prerendered ${pages.length} pages`);
        } finally {
          await rm(serverDir, { recursive: true, force: true });
        }
      },
    },

    transform(code, _id, transformOptions) {
      if (command !== 'serve' || !transformOptions?.ssr) return null;

      return wrapCommonJS(code);
    },

    configureServer(server) {
      let handler;

      /**
       * With `prerender`, the dev server renders the same pages as the build, into the same template.
       * The other pages stay as the browser renders them.
       */
      let prerendered = prerenderOptions && new Set(prerenderOptions.routes.map((route) => pathOf(route)));

      /**
       * This runs after the internal middlewares of Vite.
       * There, a page request has `req.url` = '/index.html',
       * and `req.originalUrl` is the URL of the page.
       */
      return () => {
        server.middlewares.use((req, res, next) => {
          let path = req.url.split('?')[0];

          if (!path.endsWith('.html') || !req.headers.accept?.includes('text/html')) {
            next();
            return;
          }

          if (prerendered && !prerendered.has(pathOf(req.originalUrl ?? req.url))) {
            next();
            return;
          }

          handler ??= fastbootMiddleware(
            new FastBoot({
              ...fastbootOptions,
              vite: server,
              entry: `/${entry.replace(/^\//, '')}`,
              template: prerenderOptions?.template,
            }),
          );

          handler(req, res, (error) => {
            if (error) server.ssrFixStacktrace(error);

            next(error);
          });
        });
      };
    },
  };
}

/**
 * A URL as a path to compare: '/docs/?x=1' and 'docs' are both '/docs'.
 */
function pathOf(url) {
  let path = url.split('?')[0].replace(/\/+$/, '');

  return path.startsWith('/') ? path || '/' : `/${path}`;
}

/**
 * The stylesheets of each route, from the manifest of the client build.
 * A lazy route chunk has its own CSS, and the entry of the page does not link it.
 *
 * @returns {Map<string, string[]>} route name → CSS files, relative to the build
 */
function routeStylesheets(manifest, routeName) {
  let stylesheets = new Map();

  for (let [source, chunk] of Object.entries(manifest)) {
    let name = routeName(source);

    if (!name) continue;

    let files = stylesheets.get(name) ?? [];

    collectCSS(manifest, chunk, files, new Set());
    stylesheets.set(name, files);
  }

  return stylesheets;
}

function collectCSS(manifest, chunk, files, seen) {
  if (seen.has(chunk)) return;

  seen.add(chunk);

  for (let file of chunk.css ?? []) {
    if (!files.includes(file)) files.push(file);
  }

  for (let key of chunk.imports ?? []) {
    if (manifest[key]) collectCSS(manifest, manifest[key], files, seen);
  }
}

/**
 * The route of a source module:
 *
 *   'app/-embroider-route-entrypoint.js:route=blog.js' → 'blog' (a route that Embroider splits)
 *   'app/templates/blog/post.gjs'                      → 'blog.post'
 *   'app/routes/blog.js'                               → 'blog'
 */
function defaultRouteName(source) {
  let split = /-embroider-route-entrypoint\.js:route=(.+)\.js$/.exec(source);

  if (split) return split[1];

  return /^app\/(?:templates|routes|controllers)\/(.+)\.(?:gjs|gts|js|ts|hbs)$/.exec(source)?.[1].replaceAll('/', '.');
}

/**
 * Runs `vite build --ssr` with the config of the client build.
 */
async function buildServer(config, entry, outDir) {
  let { build } = await import('vite');

  await build({
    ...config.inlineConfig,
    configFile: config.configFile ?? false,
    mode: config.mode,
    logLevel: 'warn',
    build: { ...config.inlineConfig.build, ssr: entry, outDir, emptyOutDir: true },
  });
}

/**
 * The SSR build writes one entry file, named after the entry module.
 */
async function entryFile(outDir, entry) {
  let name = basename(entry).replace(/\.[^.]+$/, '');
  let files = await readdir(outDir);
  let file = files.find((candidate) => candidate === `${name}.mjs` || candidate === `${name}.js`);

  if (!file) throw new Error(`The SSR build wrote no ${name}.mjs or ${name}.js to ${outDir}`);

  return file;
}

/**
 * The dev server evaluates SSR modules as ES modules,
 * where `module` and `exports` do not exist.
 * A CommonJS file in the dependencies gets them from this wrapper.
 *
 * A build does not need it: the bundler converts CommonJS itself.
 */
function wrapCommonJS(code) {
  if (/^(?:import\s|export\s|export\{|export default)/m.test(code)) return null;
  if (!/\bexports\s*[.[=]|\bmodule\s*\.\s*exports\b/.test(code)) return null;

  return {
    code: [
      'const __fastboot_module__ = { exports: {} };',
      '(function (module, exports, global) {',
      code,
      '})(__fastboot_module__, __fastboot_module__.exports, globalThis);',
      'export default __fastboot_module__.exports;',
    ].join('\n'),
    map: null,
  };
}
