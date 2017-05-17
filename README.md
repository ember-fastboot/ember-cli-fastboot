# Ember FastBoot

[![npm version](https://badge.fury.io/js/ember-cli-fastboot.svg)](https://badge.fury.io/js/ember-cli-fastboot)
[![Build Status](https://travis-ci.org/ember-fastboot/ember-cli-fastboot.svg?branch=master)](https://travis-ci.org/ember-fastboot/ember-cli-fastboot)
[![Build status](https://ci.appveyor.com/api/projects/status/6qcpp4ndy3ao4yv8/branch/master?svg=true)](https://ci.appveyor.com/project/embercli/ember-cli-fastboot/branch/master)

An Ember CLI addon that allows you to render and serve Ember.js apps on
the server. Using FastBoot, you can serve rendered HTML to browsers and
other clients without requiring them to download JavaScript assets.

Currently, the set of Ember applications supported is extremely limited.
As we fix more issues, we expect that set to grow rapidly. See [Known
Limitations](#known-limitations) below for a full-list.

The bottom line is that you should not (yet) expect to install this add-on in
your production app and have FastBoot work.

## Introduction Video

[![Introduction to Ember FastBoot](https://i.vimeocdn.com/video/559399270_640x360.jpg)](https://vimeo.com/157688134)

## Installation

FastBoot requires Ember 2.3 or higher.

From within your Ember CLI application, run the following command:

```
ember install ember-cli-fastboot
```

## Running

* `ember fastboot --serve-assets`
* Visit your app at `http://localhost:3000`.

You may be shocked to learn that minified code runs faster in Node than
non-minified code, so you will probably want to run the production
environment build for anything "serious."

```
ember fastboot --environment production
```

You can also specify the port (default is 3000):

```
ember fastboot --port 8088
```

See `ember help fastboot` for more.

### With `ember-cli` version 2.12.0-beta.1 and above
If your app is running ember-cli v2.12.0-beta.1+, you can just use `ember serve` instead of `ember fastboot --serve-assets` and visit at `http://localhost:4200/`.

Optionally you can even disable the fastboot serving at runtime using the `fastboot` query parameter. Example to turn off fastboot serving,
visit your app at `http://localhost:4200/?fastboot=false`. If you want to turn on fastboot serving again, simply visit at `http://localhost:4200/?fastboot=true` or `http://localhost:4200/`.

You can even disable serving fastboot with `ember serve` using an environment flag: `FASTBOOT_DISABLED=true ember serve`. If you have disabled building fastboot assets using the same flag as described [here](https://github.com/ember-fastboot/ember-cli-fastboot#double-build-times-and-no-incremental-builds), remember to also disable serving fastboot assets when using `ember serve`.

## Using Node/npm Dependencies

### Whitelisting Packages

When your app is running in FastBoot, it may need to use Node packages
to replace features that are available only in the browser.

For security reasons, your Ember app running in FastBoot can only access
packages that you have explicitly whitelisted.

To allow your app to require a package, add it to the
`fastbootDependencies` array in your app's `package.json`:

```js
{
  "name": "my-sweet-app",
  "version": "0.4.2",
  "devDependencies": {
    // ...
  },
  "dependencies": {
    // ...
  },
  "fastbootDependencies": [
    "rsvp",
    "path"
  ]
}
```

The `fastbootDependencies` in the above example means the only node
modules your Ember app can use are `rsvp` and `path`.

If the package you are using is not built-in to Node, **you must also
specify the package and a version in the `package.json` `dependencies`
hash.** Built-in modules (`path`, `fs`, etc.) only need to be added to
`fastbootDependencies`.

### Using Dependencies

From your Ember.js app, you can run `FastBoot.require()` to require a
package. This is identical to the CommonJS `require` except it checks
all requests against the whitelist first.

```js
let path = FastBoot.require('path');
let filePath = path.join('tmp', session.getID());
```

If you attempt to require a package that is not in the whitelist,
FastBoot will raise an exception.

Note that the `FastBoot` global is **only** available when running in
FastBoot mode. You should either guard against its presence or only use
it in FastBoot-only initializers.

## FastBoot Service

FastBoot registers the `fastboot` service. This service allows you to
check if you are running within FastBoot by checking
`fastboot.isFastBoot`. There is also a request object under
`fastboot.request` which exposes details about the current request being
handled by FastBoot

### Delaying the server response

By default, FastBoot waits for the `beforeModel`, `model`, and
`afterModel` hooks to resolve before sending the response back to the
client. If you have asynchrony that runs outside of those contexts, your
response may not reflect the state that you want. To solve this, the
`fastboot` service has `deferRendering` function that accepts a promise.
It will chain all promises passed to it, and the FastBoot server will
wait until all of these promises resolve before sending the response to
the client. These promises must be chained before the rendering is
complete after the model hooks. For example, if a component that is
rendered into the page makes an async call for data, registering a
promise to be resolved in its `init` hook would allow the component to
defer the rendering of the page.

### Cookies

You can access cookies for the current request via `fastboot.request`
in the `fastboot` service.

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let authToken = this.get('fastboot.request.cookies.auth');
    // ...
  }
});
```

The service's `cookies` property is an object containing the request's
cookies as key/value pairs.

### Headers

You can access the headers for the current request via `fastboot.request`
in the `fastboot` service. The `headers` object implements part of the
[Fetch API's Headers
class](https://developer.mozilla.org/en-US/docs/Web/API/Headers), the
functions available are
[`has`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/has),
[`get`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/get), and
[`getAll`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/getAll).

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let headers = this.get('fastboot.request.headers');
    let xRequestHeader = headers.get('X-Request');
    // ...
  }
});
```

### Host

You can access the host of the request that the current FastBoot server
is responding to via `fastboot.request` in the `fastboot` service. The
`host` property will return the host (`example.com` or `localhost:3000`).

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let host = this.get('fastboot.request.host');
    // ...
  }
});
```

To retrieve the host of the current request, you must specify a list of
hosts that you expect in your `config/environment.js`:

```js
module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'host',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      // ...
    },
    APP: {
      // ...
    },

    fastboot: {
      hostWhitelist: ['example.com', 'subdomain.example.com', /^localhost:\d+$/]
    }
  };
  // ...
};
```

The `hostWhitelist` can be a string or RegExp to match multiple hosts.
Care should be taken when using a RegExp, as the host function relies on
the `Host` HTTP header, which can be forged. You could potentially allow
a malicious request if your RegExp is too permissive when using the `host`
when making subsequent requests.

Retrieving `host` will error on 2 conditions:

 1. you do not have a `hostWhitelist` defined
 2. the `Host` header does not match an entry in your `hostWhitelist`

### Query Parameters

You can access query parameters for the current request via `fastboot.request`
in the `fastboot` service.

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let authToken = this.get('fastboot.request.queryParams.auth');
    // ...
  }
});
```

The service's `queryParams` property is an object containing the request's
query parameters as key/value pairs.

### Path

You can access the path (`/` or `/some-path`) of the request that the
current FastBoot server is responding to via `fastboot.request` in the
`fastboot` service.

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let path = this.get('fastboot.request.path');
    // ...
  }
});
```

### Protocol

You can access the protocol (`http` or `https`) of the request that the
current FastBoot server is responding to via `fastboot.request` in the
`fastboot` service.

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let protocol = this.get('fastboot.request.protocol');
    // ...
  }
});
```

### The Shoebox

You can pass application state from the FastBoot rendered application
to the browser rendered application using a feature called the "Shoebox".
This allows you to leverage server API calls made by the FastBoot
rendered application on the browser rendered application. Thus preventing
you from duplicating work that the FastBoot application is performing.
This should result in a performance benefit for your browser application,
as it does not need to issue server API calls whose results are available
from the Shoebox.

The contents of the Shoebox are written to the HTML as strings within
`<script>` tags by the server rendered application, which are then
consumed by the browser rendered application.

This looks like:
```html
.
.
<script type="fastboot/shoebox" id="shoebox-main-store">
{"data":[{"attributes":{"name":"AEC Professionals"},"id":106,"type":"audience"},
{"attributes":{"name":"Components"},"id":111,"type":"audience"},
{"attributes":{"name":"Emerging Professionals"},"id":116,"type":"audience"},
{"attributes":{"name":"Independent Voters"},"id":2801,"type":"audience"},
{"attributes":{"name":"Staff"},"id":141,"type":"audience"},
{"attributes":{"name":"Students"},"id":146,"type":"audience"}]}
</script>
.
.
```

You can add items into the shoebox with `shoebox.put`, and you can retrieve
items from the shoebox using `shoebox.retrieve`. In the example below we use
an object, `shoeboxStore`, that acts as our store of objects that reside in
the shoebox. We can then add/remove items from the `shoeboxStore` in the
FastBoot rendered application as we see fit. Then in the browser rendered
application, it will grab the `shoeboxStore` from the shoebox and retrieve
the record necessary for rendering this route.

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model(params) {
    let shoebox = this.get('fastboot.shoebox');
    let shoeboxStore = shoebox.retrieve('my-store');

    if (this.get('fastboot.isFastBoot')) {
      return this.store.findRecord('post', params.post_id).then(post => {
        if (!shoeboxStore) {
          shoeboxStore = {};
          shoebox.put('my-store', shoeboxStore);
        }
        shoeboxStore[post.id] = post.toJSON();
      });
    } else {
      return shoeboxStore && shoeboxStore[params.post_id];
    }
  }
});
```

## Disabling incompatible dependencies

There are two places where the inclusion of incompatible JavaScript libraries could
occur:

 1. `app.import` in the application's `ember-cli-build.js`
 2. `app.import` in an addon's `included` hook

`ember-cli-fastboot` sets the `EMBER_CLI_FASTBOOT` environment variable when it is
building the FastBoot version of the application. You can use this to prevent the
inclusion of the library at build time:

```js
if (!process.env.EMBER_CLI_FASTBOOT) {
  // This will only be included in the browser build
  app.import('some/jquery.plugin.js')
}
```

*Note*: This is soon going to be deprecated. See [this issue](https://github.com/ember-fastboot/ember-cli-fastboot/issues/360).

## Loading additional assets in FastBoot environment

Often addons require to load libraries that are specific to the FastBoot environment and only need to be loaded on the server side. This can include loading
libraries before or after the vendor file is loaded in the sandbox and/or before or after the app file is loaded in the sandbox. Since the FastBoot manifest defines
an array of vendor and app files to load in the sandbox, an addon can define additional vendor/app files to load in the sandbox as well.

If your addon requires to load something in the sandbox: you can define the `updateFastBootManifest` hook from your addon (in `index.js`):

```js
updateFastBootManifest(manifest) {
  /**
   * manifest is an object containing:
   * {
   *    vendorFiles: [<path of the vendor file to load>, ...],
   *    appFiles: [<path of the app file to load>, ...],
   *    htmlFile: '<path of the base page that should be served by FastBoot>'
   * }
   */

   // This will load the foo.js before vendor.js is loaded in sandbox
   manifest.vendorFiles.unshift('<path to foo.js under dist>');
   // This will load bar.js after app.js is loaded in the sandbox
   manifest.appFiles.push('<path to bar.js under dist>');

   // remember to return the updated manifest, otherwise your build will fail.
   return manifest;
}
```

*Note*: `process.env.EMBER_CLI_FASTBOOT` is soon going to be deprecated and [eventually removed](https://github.com/ember-fastboot/ember-cli-fastboot/issues/360).
Therefore, if you are relying on this environment variable to import something in the fastboot environment, you should instead use `updateFastBootManifest` hook.


## Known Limitations

While FastBoot is under active development, there are several major
restrictions you should be aware of. Only the most brave should even
consider deploying this to production.

### No `didInsertElement`

Since `didInsertElement` hooks are designed to let your component
directly manipulate the DOM, and that doesn't make sense on the server
where there is no DOM, we do not invoke either `didInsertElement` or
`willInsertElement` hooks. The only component lifecycle hooks called in
FastBoot are `init`, `didReceiveAttrs`, `didUpdateAttrs` and `willDestroy`.

### No jQuery

Running most of jQuery requires a full DOM. Most of jQuery will just not be
supported when running in FastBoot mode. One exception is network code for
fetching models, which we intended to support, but doesn't work at
present.

### Prototype extensions

Prototype extensions do not currently work across node "realms."  Fastboot
applications operate in two realms, a normal node environment and a [virtual machine](https://nodejs.org/api/vm.html).  Passing objects that originated from the normal realm will not contain the extension methods
inside of the sandbox environment. For this reason, it's encouraged to [disable prototype extensions](https://guides.emberjs.com/v2.4.0/configuring-ember/disabling-prototype-extensions/).

### Double build times and no incremental builds

Due to limitations in Ember CLI, builds take twice as long to generate the
second set of FastBoot assets. This also means incremental builds with
live reload don't work either. This aims to be resolved by FastBoot 1.0.
In the mean time, we introduce a short-circuit environment flag to not do
a FastBoot build:

```
FASTBOOT_DISABLED=true ember build
```

This is useful to keep your existing workflow while in development, while
still being able to deploy FastBoot. This flag will be removed in FastBoot
1.0.

## Troubleshooting

Because your app is now running in Node.js, not the browser, you'll
need a new set of tools to diagnose problems when things go wrong. Here
are some tips and tricks we use for debugging our own apps.

### Verbose Logging

Enable verbose logging by running the FastBoot server with the following
environment variables set:

```sh
DEBUG=ember-cli-fastboot:* ember fastboot
```

PRs adding or improving logging facilities are very welcome.

### Developer Tools

You can get a debugging environment similar to the Chrome developer
tools running with a FastBoot app, although it's not (yet) as easy as
in the browser.

First, install the Node Inspector:

```sh
npm install node-inspector -g
```

Make sure you install a recent release; in our experience, older
versions will segfault when used in conjunction with Contextify, which
FastBoot uses for sandboxing.

Next, start the inspector server. We found the experience too slow to be
usable until we discovered the `--no-preload` flag, which waits to
fetch the source code for a given file until it's actually needed.

```sh
node-inspector --no-preload
```

Once the debug server is running, you'll want to start up the FastBoot
server with Node in debug mode. One thing about debug mode: it makes
everything much slower. Since the `ember fastboot` command does a full
build when launched, this becomes agonizingly slow in debug mode.

Avoid the slowness by manually running the build in normal mode, then
running FastBoot in debug mode without doing a build:

```sh
ember build && node --debug-brk ./node_modules/.bin/ember fastboot --no-build
```

This does a full rebuild and then starts the FastBoot server in debug
mode. Note that the `--debug-brk` flag will cause your app to start
paused to give you a chance to open the debugger.

Once you see the output `debugger listening on port 5858`, visit
[http://127.0.0.1:8080/debug?port=5858](http://127.0.0.1:8080/debug?port=5858)
in your browser. Once it loads, click the "Resume script execution"
button (it has a ▶︎ icon) to let FastBoot continue loading.

Assuming your app loads without an exception, after a few seconds you
will see a message that FastBoot is listening on port 3000. Once you see
that, you can open a connection; any exceptions should be logged in the
console, and you can use the tools you'd expect such as `console.log`,
`debugger` statements, etc.

#### Note Regarding Node 6.4 and above

If you're using Node 6.4 and above, there's a recently resolved
[issue](https://github.com/node-inspector/node-inspector/issues/905)
involving node-inspector. [A fix](https://github.com/node-inspector/node-inspector/commit/2e5309f75099753740c4567e17fd79ee27885d71)
has been committed and published, which can be leveraged in node-inspector version ~1.0.0.

#### Incompatibility With `node --inspect`

[Node 6.3](https://nodejs.org/en/blog/release/v6.3.0/) is the first version to
offer support for the `--inspect` flag. This is intended to replace usage of
tools like node-inspector.  However the `--inspect` flag isn't suitable for
debugging FastBoot apps because Node does not support debugging of code in a vm
module context (see [this issue](https://github.com/nodejs/node/issues/7593)),
which is a module that FastBoot utilizes.

Because of this, it's recommended to use either node-inspector, or Node's
[out-of-process debugging utility](https://nodejs.org/api/debugger.html#debugger_debugger),
until a version of Node is released that resolves the above-mentioned issue.

## Tests

Run the automated tests by running `npm test`.

Note that the integration tests create new Ember applications via `ember
new` and thus have to run an `npm install`, which can take several
minutes, particularly on slow connections.

To speed up test runs you can run `npm run test:precook` to "precook" a
`node_modules` directory that will be reused across test runs.

### Debugging Integration Tests

Run the tests with the `DEBUG` environment variable set to
`fastboot-test` to see verbose debugging output.

```sh
DEBUG=fastboot-test npm test
```
