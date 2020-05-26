## v3.1.0 (2020-05-26)

#### :rocket: Enhancement
* [#272](https://github.com/ember-fastboot/fastboot/pull/272) Introduce html oriented manifest format (introduces better Embroider interop) ([@thoov](https://github.com/thoov))

#### Committers: 1
- Travis Hoover ([@thoov](https://github.com/thoov))


Must provide GITHUB_AUTH

## v3.0.2 (2020-03-24)

#### :rocket: Enhancement
* [#262](https://github.com/ember-fastboot/fastboot/pull/264) Add sandbox queue management when using `buildSandboxPerVisit` ([@kratiahuja](https://github.com/kratiahuja))

#### Committers: 1
- Krati Ahuja ([@kratiahuja](https://github.com/kratiahuja))

## v3.0.1 (2020-03-12)

#### :rocket: Enhancement
* [#262](https://github.com/ember-fastboot/fastboot/pull/262) Improve performance when using new sandbox per visit by building sandbox after the request ([@kratiahuja](https://github.com/kratiahuja))

#### Committers: 1
- Krati Ahuja ([@kratiahuja](https://github.com/kratiahuja))

## v3.0.0 (2020-01-31)

#### :boom: Breaking Change
* [#258](https://github.com/ember-fastboot/fastboot/pull/258) Drop Node 8 support ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#252](https://github.com/ember-fastboot/fastboot/pull/252) Expose option to allow a new sandbox per visit ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#259](https://github.com/ember-fastboot/fastboot/pull/259) Update various dependencies to latest versions. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v3.0.0-beta.3 (2019-11-01)

#### :bug: Bug Fix
* [#250](https://github.com/ember-fastboot/fastboot/pull/250) Fix invalid syntax with deferRendering. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v3.0.0-beta.2 (2019-11-01)

#### :boom: Breaking Change
* [#247](https://github.com/ember-fastboot/fastboot/pull/247) Remove najax from default set of sandbox globals. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* [#245](https://github.com/ember-fastboot/fastboot/pull/245) Refactor sandboxGlobals -> buildSandboxGlobals ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#248](https://github.com/ember-fastboot/fastboot/pull/248) Remove ember-source from devDependencies. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 1
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))

## v3.0.0-beta.1 (2019-10-30)

#### :boom: Breaking Change
* [#236](https://github.com/ember-fastboot/fastboot/pull/236) Refactor to use a single sandboxed context per visit request. ([@rwjblue](https://github.com/rwjblue))
* [#225](https://github.com/ember-fastboot/fastboot/pull/225) Drop support for Node 6, 9, and 11. ([@kiwiupover](https://github.com/kiwiupover))

#### :rocket: Enhancement
* [#229](https://github.com/ember-fastboot/fastboot/pull/229) Add `FastBoot.distPath` ([@stefanpenner](https://github.com/stefanpenner))

#### :bug: Bug Fix
* [#227](https://github.com/ember-fastboot/fastboot/pull/227) Restore allowing fallback require from working directory ([@xg-wang](https://github.com/xg-wang))
* [#219](https://github.com/ember-fastboot/fastboot/pull/219) Fix an incorrect `debug()` call ([@CvX](https://github.com/CvX))

#### :memo: Documentation
* [#235](https://github.com/ember-fastboot/fastboot/pull/235) Document `reload` method. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#243](https://github.com/ember-fastboot/fastboot/pull/243) Add automated release setup. ([@rwjblue](https://github.com/rwjblue))
* [#238](https://github.com/ember-fastboot/fastboot/pull/238) Add basic memory profiling script to `dev/` folder. ([@rwjblue](https://github.com/rwjblue))
* [#237](https://github.com/ember-fastboot/fastboot/pull/237) Add dev script to make tracing easier. ([@rwjblue](https://github.com/rwjblue))
* [#234](https://github.com/ember-fastboot/fastboot/pull/234) Remove `rsvp` dependency. ([@rwjblue](https://github.com/rwjblue))
* [#233](https://github.com/ember-fastboot/fastboot/pull/233) Update dependencies/devDependencies to latest. ([@rwjblue](https://github.com/rwjblue))
* [#232](https://github.com/ember-fastboot/fastboot/pull/232) Make a single `Sandbox` base class. ([@rwjblue](https://github.com/rwjblue))
* [#231](https://github.com/ember-fastboot/fastboot/pull/231) General repo cleanup. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 5
- David Laird ([@kiwiupover](https://github.com/kiwiupover))
- Jarek Radosz ([@CvX](https://github.com/CvX))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))
- Thomas Wang ([@xg-wang](https://github.com/xg-wang))

# FastBoot Changelog

## v2.0.0 (2018-12-10)

#### :boom: Breaking Change
* [#202](https://github.com/ember-fastboot/fastboot/pull/202) Update Node.js support matrix ([@bobisjan](https://github.com/bobisjan))

#### :rocket: Enhancement
* [#188](https://github.com/ember-fastboot/fastboot/pull/188) Update various dependencies to latest. ([@izelnakri](https://github.com/izelnakri))
* [#206](https://github.com/ember-fastboot/fastboot/pull/206) Update minimum version of simple-dom to 1.4.0. ([@rwjblue](https://github.com/rwjblue))

#### :bug: Bug Fix
* [#200](https://github.com/ember-fastboot/fastboot/pull/200) Allow to require module path from whitelisted dependency ([@bobisjan](https://github.com/bobisjan))
* [#201](https://github.com/ember-fastboot/fastboot/pull/201) Remove usage of deprecated exists-sync ([@SergeAstapov](https://github.com/SergeAstapov))

#### :memo: Documentation
* [#197](https://github.com/ember-fastboot/fastboot/pull/197) Fixed small typo ([@kiwiupover](https://github.com/kiwiupover))

#### :house: Internal
* [#204](https://github.com/ember-fastboot/fastboot/pull/204) fix(package): update debug to version 4.1.0 ([@rwjblue](https://github.com/rwjblue))
* [#203](https://github.com/ember-fastboot/fastboot/pull/203) Remove .babelrc configuration file ([@bobisjan](https://github.com/bobisjan))

#### Committers: 5
- David Laird ([@kiwiupover](https://github.com/kiwiupover))
- Izel Nakri ([@izelnakri](https://github.com/izelnakri))
- Jan Bobisud ([@bobisjan](https://github.com/bobisjan))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))

### 1.2.0

* Add support for setting attributes on the `<html>` element (e.g. `<html lang="fr">`).

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
