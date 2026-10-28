# FastBoot

FastBoot renders the pages of an Ember app on the server, in Node.js.
The browser shows the HTML at once.
When the app boots in the browser, it takes over that HTML and does not render it again.

On the server, the app runs with a DOM, as it does in a browser.
`document` and `window` exist, modifiers run, and `fetch` works.
Apps and addons do not need code that is only for the server.

FastBoot works with classic apps (ember-cli and broccoli) and with Vite apps.
It renders pages for each request (SSR), or once at build time (SSG).

| Package                                             | What it gives you                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [`fastboot`](packages/fastboot)                     | the renderer for Node.js, a request handler for servers, and a Vite plugin           |
| [`ember-cli-fastboot`](packages/ember-cli-fastboot) | the browser boot, the `fastboot` service, and `ember serve` support for classic apps |

Requirements: Node.js 22.12 or later, and `ember-source` 6.4 or later.

Upgrading from version 6? Read [UPGRADING.md](UPGRADING.md).

## Set up a classic app

1. Install the packages:

   ```sh
   pnpm add --save-dev ember-cli-fastboot fastboot
   ```

2. Run `ember serve`. FastBoot renders each page.
   To see a page without FastBoot, add `?fastboot=false` to the URL.

3. In production, serve the files of `dist/`, and send every other request to FastBoot.
   This example uses Express:

   ```js
   import express from 'express';
   import fastbootMiddleware from 'fastboot/middleware';

   const app = express();

   app.use(express.static('dist', { index: false }));
   app.use(fastbootMiddleware({ distPath: 'dist' }));

   app.listen(3000);
   ```

   `index: false` is necessary. Without it, `/` gets the `index.html` file, not a rendered page.

## Set up a Vite app

### A Vite app in development

1. Install the packages:

   ```sh
   pnpm add --save-dev ember-cli-fastboot fastboot
   ```

2. Add the plugin to `vite.config.mjs`:

   ```js
   import { fastboot } from 'fastboot/vite';

   export default defineConfig({
     plugins: [
       // the plugins of the app
       fastboot(),
     ],
   });
   ```

3. Add the SSR entry, `app/app-ssr.js`:

   ```js
   import Application from './app';
   import config from './config/environment';

   export { settled } from 'ember-cli-fastboot/settled';

   export function createSsrApp() {
     return Application.create({ ...config.APP, autoboot: false });
   }
   ```

4. In `index.html`, boot the app with `boot()`:

   ```html
   <script type="module">
     import { boot } from 'ember-cli-fastboot/boot';
     import Application from './app/app';
     import environment from './app/config/environment';

     boot(Application, environment);
   </script>
   ```

5. If the app does not use `classicEmberSupport()`, add the service to the modules of the app:

   ```js
   import FastBootService from 'ember-cli-fastboot/services/fastboot';

   export default class App extends Application {
     modules = {
       './services/fastboot': FastBootService,
       // the other modules of the app
     };
   }
   ```

6. Run `vite`. The dev server renders each page with FastBoot.

### A Vite app in production

1. Build the browser files and the server bundle:

   ```sh
   vite build --outDir dist/client
   vite build --ssr app/app-ssr.js --outDir dist/server
   ```

2. Serve the files of `dist/client`, and send every other request to FastBoot:

   ```js
   app.use(express.static('dist/client', { index: false }));
   app.use(fastbootMiddleware({ distPath: 'dist/client', entry: 'dist/server/app-ssr.mjs' }));
   ```

## Prerender pages at build time (SSG)

A prerendered page is a static file, so it needs no Node.js server.

In a Vite app, add `prerender` to the plugin, then run `vite build`:

```js
fastboot({
  prerender: { routes: ['/', '/about', '/blog'] },
});
```

`vite build` then builds the SSR bundle, and writes `dist/about/index.html` and the other pages.
To render into a different HTML file of the build, set `prerender.template`, for example `'index.ssg.html'`.

Each page links the stylesheets of its lazy routes, so that the page has its styles before the JavaScript loads.
FastBoot finds the routes that Embroider splits, and modules in `app/templates`, `app/routes`, and `app/controllers`.
For another file layout, set `prerender.routeName`:

```js
fastboot({
  prerender: {
    routes: ['/docs'],
    // 'app/routes/docs/+template.gts' → 'docs'
    routeName: (source) => /^app\/routes\/(.+)\/\+template\.gts$/.exec(source)?.[1].replaceAll('/', '.'),
  },
});
```

In a classic app, call `prerender()` after `ember build`:

```js
import { prerender } from 'fastboot/prerender';

await prerender({ distPath: 'dist', routes: ['/', '/about', '/blog'] });
```

With `prerender`, the dev server renders only the `prerender.routes`, into the same template as the build.
The browser renders the other pages.

The build fails when a page has an error, or a status code of 400 or more.
The browser takes over each page, as it does after SSR.

## Where the rendered HTML goes

FastBoot renders into the `index.html` of the app:

- `<head>`: the content goes at `<!-- FASTBOOT_HEAD -->`, or else before `</head>`.
- `<body>`: the content goes at `<!-- FASTBOOT_BODY -->`, or else at the start of `<body>`.
- Attributes that the app sets on `<html>` and `<body>` are added to those tags.
- A `<title>` that the app sets replaces the `<title>` of `index.html`.

In a classic app, `ember-cli-fastboot` adds the two markers.
If the app has a `rootElement` other than `body`, put `<!-- FASTBOOT_BODY -->` inside that element.

## Write code as for a browser

Write the same code that you write for the browser.
Do not check whether the code runs on the server.

- Use `document`, `window`, `location`, and `fetch` as usual.
  During a render, `location` is the URL of the request.
- To put content into `<head>`, use `document.head`, for example with `{{#in-element}}`.
- Set `document.title`, or use `ember-page-title`.
- Modifiers run, and event listeners can be added.
  Nothing on the server sends events.

FastBoot sends the page when:

- the route transitions are complete, with their models
- the promises given to `deferRendering()` are settled
- the run loop has no more work scheduled, for example `later()` timers

A Vite app gets the last item from the `settled` export of its SSR entry.

The server does not compute layout.
Sizes from `getBoundingClientRect()` and similar APIs are zero during a render.

### For addon authors

An addon needs nothing for FastBoot.
Write the addon for the browser.
Do not inject the `fastboot` service to skip code.

## The `fastboot` service

The service gives access to the HTTP request and response of a render.
Most apps do not need it.

```js
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class NotFoundRoute extends Route {
  @service fastboot;

  model() {
    this.fastboot.response.statusCode = 404;
  }
}
```

In the browser, `response` is an object that nothing reads, so code like this needs no condition.

| Property or method          | During a render                                            | In the browser          |
| --------------------------- | ---------------------------------------------------------- | ----------------------- |
| `request.method`            | the HTTP method                                            | `request` is `null`     |
| `request.path`              | the path and query of the URL                              |                         |
| `request.protocol`          | `http:` or `https:`                                        |                         |
| `request.headers.get(name)` | a request header; also `getAll(name)` and `has(name)`      |                         |
| `request.cookies`           | the cookies, as an object                                  |                         |
| `request.queryParams`       | the query parameters, as an object                         |                         |
| `request.host`              | the `Host` header, if it matches the `allowedHosts` option |                         |
| `response.statusCode`       | the status code of the response                            | has no effect           |
| `response.headers`          | the headers of the response: `set`, `append`, `delete`     | has no effect           |
| `metadata`                  | the `metadata` that the server gave to this render         | `undefined`             |
| `deferRendering(promise)`   | FastBoot waits for the promise                             | does nothing            |
| `shoebox.put(key, value)`   | sends the value with the page                              | does nothing            |
| `shoebox.retrieve(key)`     | the value from `put`                                       | the value from the page |
| `isFastBoot`                | `true`                                                     | `false`                 |

`isFastBoot` exists so that apps can upgrade.
Do not use it in new code.

### The shoebox

The shoebox sends data from the server render to the browser,
so that the browser does not request the same data again.
The same code runs on the server and in the browser:

```js
export default class PostRoute extends Route {
  @service fastboot;

  async model({ id }) {
    let { shoebox } = this.fastboot;
    let post = shoebox.retrieve(`post-${id}`) ?? (await loadPost(id));

    shoebox.put(`post-${id}`, post);

    return post;
  }
}
```

A value must survive `JSON.stringify`.

## Redirects and errors

- A route that transitions to another URL during the render gives a `307` response to the final URL.
  To change the status code, use the `redirectCode` option.
- A URL that has no route goes to the next request handler.
- A render that throws goes to the error handler of the server.
  With `resilient: true`, the request handler sends `index.html` with status `500`, and the browser renders the page.

## Options

The options of the renderer, the request handler, and the Vite plugin are in the [`fastboot` README](packages/fastboot/README.md).

For `ember serve`, put the options in `config/fastboot.js`:

```js
module.exports = function (environment) {
  return {
    allowedHosts: ['example.com', /^localhost:\d+$/],
  };
};
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
