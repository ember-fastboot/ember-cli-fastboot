# Ember FastBoot

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
    'rsvp',
    'path'
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

### Cookies

You can access cookies for the current request via the `fastboot`
service.

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let authToken = this.get('fastboot.cookies.auth');
    // ...
  }
});
```

The service's `cookies` property is an object containing the request's
cookies as key/value pairs.

### Host

You can access the host of the request that the current FastBoot server
is responding to via the `fastboot` service. The `host` function will
return the protocol and the host (`https://example.com`).

```js
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let host = this.get('fastboot.host');
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

## Known Limitations

While FastBoot is under active development, there are several major
restrictions you should be aware of. Only the most brave should even
consider deploying this to production.

### No `didInsertElement`

Since `didInsertElement` hooks are designed to let your component
directly manipulate the DOM, and that doesn't make sense on the server
where there is no DOM, we do not invoke either `didInsertElement` or
`willInsertElement` hooks.

### No jQuery

Running most of jQuery requires a full DOM. Most of jQuery will just not be
supported when running in FastBoot mode. One exception is network code for
fetching models, which we intended to support, but doesn't work at
present.

### No JavaScript Served

Right now, this is only useful for creating an HTML representation of
your app at a particular route and serving it statically. Eventually, we
will support *also* serving the JavaScript payload, which can takeover
once it has finished loading and making the app fully interactive.

In the meantime, this is probably only useful for cURL or search
crawlers.

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
