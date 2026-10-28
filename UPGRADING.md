# Upgrading to FastBoot 7

FastBoot 7 runs the app on the server with a DOM, the same way a browser runs it.
There is one build for the browser and the server.
Most of the upgrade is code that you remove.

## Do this first

1. Use Node.js 22.12 or later.
2. Update `ember-cli-fastboot` and `fastboot` to 7.
3. Remove `fastboot-express-middleware` and `fastboot-app-server`. Use `fastboot/middleware` in your server. See [Set up a classic app](README.md#set-up-a-classic-app).
4. Rename the `hostWhitelist` config to the `allowedHosts` option of `FastBoot` or of the middleware.
5. Run the app, and remove server-only code with the list below.

## Code that you can remove

The app has a DOM on the server, and code that works in a browser works there too.

| Before                                                                  | Now                                                       |
| ----------------------------------------------------------------------- | --------------------------------------------------------- |
| `if (!this.fastboot.isFastBoot) { /* DOM code */ }`                     | the DOM code, with no condition                           |
| `if (typeof FastBoot === 'undefined')`                                  | the code inside the condition; `FastBoot` is not a global |
| `FastBoot.require('node-fetch')`                                        | `fetch`                                                   |
| `if (this.fastboot.isFastBoot) this.fastboot.shoebox.put(key, value)`   | `this.fastboot.shoebox.put(key, value)`                   |
| `if (this.fastboot.isFastBoot) this.fastboot.response.statusCode = 404` | `this.fastboot.response.statusCode = 404`                 |
| the `-document` service, to reach `<head>` or `<body>`                  | `document.head` and `document.body`                       |
| a `fastboot/` directory in the app or an addon                          | nothing; the app code runs on the server                  |
| `treeForFastBoot`, `updateFastBootManifest`, `fastbootDependencies`     | nothing                                                   |
| `app.import(file, { using: [{ transformation: 'fastbootShim' }] })`     | `app.import(file)`                                        |

`didInsertElement`, `didRender`, and modifiers now run on the server.

## Removed options and features

| Removed                                                      | Replacement                                                          |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| the `vm` sandbox, `buildSandboxGlobals`                      | none; the app runs in a worker thread                                |
| `buildSandboxPerVisit`, `maxSandboxQueueSize`                | `workers`; each render gets a new application instance               |
| `sandboxGlobals`                                             | none                                                                 |
| the `package.json` manifest in `dist`                        | none; FastBoot reads `index.html`                                    |
| `result.chunks()`                                            | `result.html()`                                                      |
| `<!-- EMBER_CLI_FASTBOOT_BODY -->` and the other old markers | `<!-- FASTBOOT_HEAD -->` and `<!-- FASTBOOT_BODY -->`, or no markers |
| `EXPERIMENTAL_RENDER_MODE_SERIALIZE`                         | none; the browser always takes over the rendered page                |
| `config.fastboot.redirectCode`                               | the `redirectCode` option                                            |
| `config.fastboot.fastbootHeaders` (`x-fastboot-path`)        | none                                                                 |
| the `fastboot` `location` implementation                     | none; FastBoot finds redirects from the final URL                    |

## Behavior that changed

- The browser always takes over the rendered page (rehydration). It does not remove the page and render it again.
- Shoebox scripts are in `<head>`, not at the end of `<body>`.
- `fastboot.metadata` and the request body go to a worker thread, so they must survive `structuredClone`.
- During a render, `location` is the URL of the request.
  The host is the `Host` header only if it matches `allowedHosts`. Otherwise, it is `localhost`.
- `result.html()` returns a string, not a promise. `await result.html()` still works.

## Vite apps

FastBoot 7 works with Vite apps. See [Set up a Vite app](README.md#set-up-a-vite-app).
