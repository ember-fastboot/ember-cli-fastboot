# fastboot

Renders the pages of an Ember app in Node.js.
To set up an app, read the [FastBoot README](../../README.md).

The app runs with a DOM ([happy-dom](https://github.com/capricorn86/happy-dom)), as it does in a browser.
Each worker thread loads the app one time, and renders one page at a time.

## `FastBoot`

```js
import FastBoot from 'fastboot';

// a classic build
const fastboot = new FastBoot({ distPath: 'dist' });

// a Vite build
const fastboot = new FastBoot({ distPath: 'dist/client', entry: 'dist/server/app-ssr.mjs' });

const result = await fastboot.visit('/photos?page=2', { request: req, response: res });

res.statusCode = result.statusCode;
res.end(result.html());
```

### Options

| Option           | Default                     | What it does                                                                                    |
| ---------------- | --------------------------- | ----------------------------------------------------------------------------------------------- |
| `distPath`       |                             | the directory of the build that has `index.html`                                                |
| `entry`          |                             | the SSR bundle of a Vite build; without it, `distPath` is a classic build                       |
| `template`       | `index.html`                | the HTML file to render into, in `distPath` (or with `vite`, in the root of the app)            |
| `vite`           |                             | a Vite dev server; FastBoot then renders the current source files, and `entry` is a source path |
| `workers`        | `os.availableParallelism()` | the number of worker threads                                                                    |
| `allowedHosts`   |                             | hosts for `fastboot.request.host`: strings, or `RegExp`s                                        |
| `resilient`      | `false`                     | when `true`, a failed render resolves with `result.error` set; when `false`, `visit()` rejects  |
| `settledTimeout` | `10000`                     | milliseconds to wait for the app to settle; after that, FastBoot sends the page as it is        |
| `redirectCode`   | `307`                       | the status code when a route redirects during the render                                        |

When the `Host` header of a request matches `allowedHosts`, `location` in the app has that host.
Otherwise, `location` has `http://localhost`.

### Methods

| Method                        | What it does                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------- |
| `visit(url, options)`         | renders a URL; resolves with a `Result`                                         |
| `reload({ distPath, entry })` | loads the build again; renders that started before finish with the old build    |
| `ready()`                     | resolves when the workers have loaded the app; rejects if the app does not load |
| `destroy()`                   | stops the workers                                                               |

Options of `visit()`:

| Option      | What it does                                                                   |
| ----------- | ------------------------------------------------------------------------------ |
| `request`   | the Node.js request, for `fastboot.request`                                    |
| `response`  | the Node.js response; its headers are the first headers of `fastboot.response` |
| `metadata`  | data for `fastboot.metadata`; it must survive `structuredClone`                |
| `html`      | the page to render into; the default is the `index.html` of the build          |
| `resilient` | overrides the `resilient` option for this render                               |

### `Result`

| Member          | What it is                                                                               |
| --------------- | ---------------------------------------------------------------------------------------- |
| `statusCode`    | the status code that the app set, or `200`                                               |
| `headers`       | the headers that the app set: `get`, `getAll`, `has`, `entries`, `keys`                  |
| `error`         | the error of a failed render                                                             |
| `routeNames`    | the active routes after the render, from the top: `['application', 'blog', 'blog.post']` |
| `html()`        | the full page                                                                            |
| `domContents()` | `{ head, body }`: the rendered content without the page                                  |

For a redirect, `html()` is a short page with a link to the new URL.
For a failed render, `html()` is the page without rendered content, so that the browser renders it.

## `fastboot/middleware`

A request handler with the signature `(req, res, next)`.
It works with `node:http`, Express, Connect, and the Vite dev server.

```js
import fastbootMiddleware from 'fastboot/middleware';

app.use(fastbootMiddleware({ distPath: 'dist' }, { resilient: true }));
```

The first argument is a `FastBoot`, or the options for `new FastBoot()`.

| Option      | What it does                                                                            |
| ----------- | --------------------------------------------------------------------------------------- |
| `resilient` | when `true`, a failed render sends the page with status `500` for the browser to render |
| `metadata`  | a function of the request; its result is `fastboot.metadata`                            |

- `GET` and `HEAD` requests are rendered. Other methods go to `next()`.
- A URL that has no route goes to `next()`.
- A failed render goes to `next(error)`, unless `resilient` is `true`.

## `fastboot/prerender`

```js
import { prerender } from 'fastboot/prerender';

let pages = await prerender({ distPath: 'dist', routes: ['/', '/about'] });
```

Renders each URL, and writes the page as `<outDir>/<url>/index.html`.
It resolves with `{ url, file, statusCode }` for each page.
It rejects with an `AggregateError` when a page has an error, or a status code of 400 or more.

| Option          | What it does                                                            |
| --------------- | ----------------------------------------------------------------------- |
| `routes`        | the URLs to render                                                      |
| `distPath`      | the directory of the build                                              |
| `entry`         | the SSR bundle of a Vite build                                          |
| `template`      | the HTML file in `distPath` to render into; the default is `index.html` |
| `outDir`        | the directory for the pages; the default is `distPath`                  |
| `transformHtml` | `(html, { url, result }) => html`: changes a page before it is written  |

The other options of `FastBoot`, for example `workers`, also apply.

## `fastboot/vite`

```js
import { fastboot } from 'fastboot/vite';

export default defineConfig({
  plugins: [fastboot({ entry: 'app/app-ssr.js' })],
});
```

- `vite`: the dev server renders each page request with the current source files.
  A failed render shows the error page of Vite.
- `vite build --ssr <entry>`: the server bundle includes every dependency.

- `vite build` with the `prerender` option: also builds the SSR bundle, and writes a page for each route.
  The dev server then renders only those routes, into the `prerender.template`.

The options are `entry` (default `app/app-ssr.js`), `prerender`, and `allowedHosts`, `settledTimeout`, and `redirectCode` from above.

| `prerender` option | What it does                                                           |
| ------------------ | ---------------------------------------------------------------------- |
| `routes`           | the URLs of the pages                                                  |
| `template`         | the HTML file of the build to render into; the default is `index.html` |
| `routeName`        | `(source) => name`: the route of a source module, for its stylesheets  |

Each page links the CSS of the modules of its routes.
The default `routeName` reads the routes that Embroider splits, and `app/templates`, `app/routes`, and `app/controllers`.

## The SSR entry of a Vite app

The entry module exports:

- `createSsrApp()`: returns an `Application` that was created with `autoboot: false`
- `settled()` (optional): resolves when the app has no more work.
  `ember-cli-fastboot/settled` waits for the run loop.
