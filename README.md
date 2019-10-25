# FastBoot

[![Greenkeeper badge](https://badges.greenkeeper.io/ember-fastboot/fastboot.svg)](https://greenkeeper.io/)
[![npm version](https://badge.fury.io/js/fastboot.svg)](https://badge.fury.io/js/fastboot)
[![Build Status](https://travis-ci.org/ember-fastboot/fastboot.svg?branch=master)](https://travis-ci.org/ember-fastboot/fastboot)
![Ember Version](https://embadge.io/v1/badge.svg?start=2.3.0)

FastBoot is a library for rendering Ember.js applications in Node.js.

For more information about FastBoot, see
[www.ember-fastboot.com][ember-fastboot], the Ember CLI addon that's a
prerequisite for developing FastBoot apps.

[ember-fastboot]: https://www.ember-fastboot.com

To serve server-rendered versions of your Ember app over HTTP, see the
[FastBoot App
Server](https://github.com/ember-fastboot/fastboot-app-server).

FastBoot requires Node.js v6 or later.

## Usage

```js
const FastBoot = require('fastboot');

let app = new FastBoot({
  distPath: 'path/to/dist',
  // optional boolean flag when set to true does not reject the promise if there are rendering errors (defaults to false)
  resilient: <boolean>,
  sandboxGlobals: {...} // optional map of key value pairs to expose in the sandbox
});

app.visit('/photos', options)
  .then(result => result.html())
  .then(html => res.send(html));
```

In order to get a `dist` directory, you will first need to build your
Ember application, which packages it up for using in both the browser
and in Node.js.

### Default globals

`FastBoot` object will be available to the sandboxed environment. This object has the following form:

```
FastBoot.require  // provides a mechanism to load additional modules. Note: these modules are only those included in the module whitelist
FastBoot.config   // a function which takes a key, and returns the corresponding fastboot config value
FastBoot.distPath // readOnly accessor that provides the dist path for the current fastboot sandbox
```

### Additional configuration

`app.visit` takes a second parameter as `options` above which a map and allows to define additional optional per request
configuration:

- `resilient`: whether to reject the returned promise if there is an error during rendering. If not defined, defaults to the app's resilient setting.
- `html`: the HTML document to insert the rendered app into. Uses the built app's index.html by default.
- `metadata`: per request meta data that is exposed in the app via the [fastboot service](https://github.com/ember-fastboot/ember-cli-fastboot/blob/master/app/services/fastboot.js).
- `shouldRender`: boolean to indicate whether the app should do rendering or not. If set to false, it puts the app in routing-only. Defaults to true.
- `disableShoebox`: boolean to indicate whether we should send the API data in the shoebox. If set to false, it will not send the API data used for rendering the app on server side in the index.html. Defaults to false.
- `destroyAppInstanceInMs`: whether to destroy the instance in the given number of ms. This is a failure mechanism to not wedge the Node process

### Build Your App

To get your Ember.js application ready to both run in your user's
browsers and run inside the FastBoot environment, run the Ember CLI
build command:

```sh
$ ember build --environment production
```

(You will need to have already set up the [ember-cli-fastboot](https://github.com/ember-fastboot/ember-cli-fastboot) addon.
For more information, see the [FastBoot quickstart][quickstart].)

[quickstart]: https://www.ember-fastboot.com/quickstart

Once this is done, you will have a `dist` directory that contains the
multi-environment build of your app.

Run the command to install run time node modules:

```sh
$ cd dist/
$ npm install
```

Upload the `dist/` folder including `node_modules` to your FastBoot server.

### Command Line

You can start a simple HTTP server that responds to incoming requests by
rendering your Ember.js application using the [FastBoot App Server](https://github.com/ember-fastboot/fastboot-app-server#ember-fastboot-app-server)

### Debugging

Run `fastboot` with the `DEBUG` environment variable set to `fastboot:*`
for detailed logging.

### The Shoebox

You can pass application state from the FastBoot rendered application to
the browser rendered application using a feature called the "Shoebox".
This allows you to leverage server API calls made by the FastBoot rendered
application on the browser rendered application. Thus preventing you from
duplicating work that the FastBoot application is performing. This should
result in a performance benefit for your browser application, as it does
not need to issue server API calls whose results are available from the
Shoebox.

The contents of the Shoebox are written to the HTML as strings within
`<script>` tags by the server rendered application, which are then consumed
by the browser rendered application.

This looks like:
```html
.
.
<script type="fastboot/shoebox" id="shoebox-main-store">
{"data":[{"attributes":{"name":"AEC Professionals"},"id":106,"type":"audience"},
{"attributes":{"name":"Components"},"id":111,"type":"audience"},
{"attributes":{"name":"Emerging Professionals"},"id":116,"type":"audience"},
{"attributes":{"name":"Independent Voters"},"id":2801,"type":"audience"},
{"attributes":{"name":"Members"},"id":121,"type":"audience"},
{"attributes":{"name":"Partners"},"id":126,"type":"audience"},
{"attributes":{"name":"Prospective Members"},"id":131,"type":"audience"},
{"attributes":{"name":"Public"},"id":136,"type":"audience"},
{"attributes":{"name":"Staff"},"id":141,"type":"audience"},
{"attributes":{"name":"Students"},"id":146,"type":"audience"}]}
</script>
.
.
```
