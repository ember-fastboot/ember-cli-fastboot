# FastBoot Changelog

### 1.1.4-beta.1

* Enable rehydration from glimmer-vm as opt-in
### 1.1.3

* Add markers before and after the body to be able to remove rootless apps

### 1.1.2

* Adds API to allow chunking shoebox responses for better performance.

### 1.1.1

* Implement `unknownProperty` in FastbootHeaders to prevent users mistakenly use `Ember.get(headers, headerName)`

### 1.1.0

* Add the ability to support configuration for multiple namespaces to `FastBoot.config`.

### 1.0.0-rc.3

* Remove Node 0.12 support.

### 1.0.0-rc.2

* Set the entry point to the built cjs

### 1.0.0-beta.5

* Only access instance.getURL if the instance has booted
* Exclude test files from npm package

### 1.0.0-beta.4

* najax dependency updated to 0.7.0, which now handle nested query
  params
* Don't obscure errors during instance creation
* Made request compatible with nodejs' ClientRequest instances

### 1.0.0-beta.3

* Responses with status codes `204` or `3xx` no longer return the
  rendered EmberApp
* Error message for `fastboot.request.host` now returns the Host header
* najax dependency updated to 0.6.0, which now handles gzip responses

### 1.0.0-beta.2

* Adds support for the "shoebox"‑a place to put data that should be
  shared from the server-rendered app to the browser-rendered version.

### 1.0.0-beta.1

* This version is a significant change from previous versions.
* Responsibility for serving HTTP requests has been extracted to the
  [fastboot-express-middleware](https://github.com/ember-fastboot/fastboot-express-middleware)
  and
  [fastboot-app-server](https://github.com/ember-fastboot/fastboot-app-server)
  repositories.
* The name of this project has been changed to reflect the reduction in
  responsibilities: it is now just `fastboot`, a library for rendering
  Ember apps on the server, instead of `fastboot-app-server`.
* The minimum required Node version is now v4. Support for 0.12 will be
  added later via transpiling.
* Adds a `resilient` mode, where errors during rendering are suppressed
  and a blank HTML page is returned instead.
* JSHint has been added to the automated tests.
* Calling `visit()` returns a `Result` object that encapsulates the
  rendered result.

### 0.7.3

* Application config is now stored in the built application's
  `package.json`. This allows turning the `storeConfigInMeta` back on
  for FastBoot apps.
* Setting the document's title via `document.title` is deprecated. Use the
  [ember-cli-head](https://github.com/ronco/ember-cli-head) addon
  instead.

### 0.7.2

* The HTTP response object is now exposed to the FastBoot service.

### 0.7.1

* Fixes an issue where requiring built-in modules via
  `FastBoot.require()` wouldn't work.

### 0.7.0

* Removes the contextify dependency. This should significantly improve
  install speed and platform compatibility, at the expense of dropping
  support for Node 0.10.
* Improves compatibility of the request headers object with the [Headers
  specification](https://developer.mozilla.org/en-US/docs/Web/API/Headers).

### 0.6.2

* Adds the ability for the FastBoot service to defer rendering the
  response by providing a promise.

### 0.6.0

* Adds hot reloading of app.
* Fixes an issue where the `console` global was not available inside the
  FastBoot sandbox.
* Makes incoming HTTP request available to the Ember app.
