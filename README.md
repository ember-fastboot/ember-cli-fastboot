# Ember FastBoot

An Ember CLI Addon that allows you to render and serve Ember.js apps on the server. Using FastBoot, you can serve rendered HTML to browsers and other clients without requiring them to download JavaScript assets.

## How It Works

FastBoot works by creating a Node virtual [sandbox](https://github.com/ember-fastboot/fastboot/blob/master/lib/ember-app.js#L50-L75) and [executing](https://github.com/ember-fastboot/fastboot/blob/master/lib/ember-app.js#L165-L232) your Ember Application within it.

Most Ember applications should work out of the box. However, there are some patterns that you be sure should follow to to guarantee that your application is fully FastBoot compatible. See [Tips and Tricks](#tips-and-tricks) below for a full-list.

## Introduction Video

[![Introduction to Ember FastBoot](https://i.vimeocdn.com/video/559399270_640x360.jpg)](https://vimeo.com/157688134)

## Installation

FastBoot requires Ember 2.3 or higher.

From within your Ember CLI application, run the following command:

```
ember install ember-cli-fastboot
```

## Running

- `ember fastboot --serve-assets`
- Visit your app at `http://localhost:3000`.

You may be shocked to learn that minified code runs faster in Node than non-minified code, so you will probably want to run the production environment build for anything "serious."

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

For security reasons, if you need to access node packages or native modules from within FastBoot you should whitelist them. FastBoot will only let you call or require packages that have been added to the `fastbootDependencies` whitelist.

Example:

```javascript
{
  "name": "my-sweet-app",
  "version": "0.4.2",
  "devDependencies": {
    // ...
  },
  "dependencies": {
    "rsvp": "3.0.0"
  },
  "fastbootDependencies": [
    "rsvp",
    "path"
  ]
}
```

In this example, we can now require `rsvp` and `path`. Because `rsvp` is an npm package, we need to specify it in dependencies. Because `path` is a built-in node module, we only have to add it `fastbootDependencies`.

### Requiring Dependencies

Now that your packages are whitelisted, in your Ember.js app you can use `FastBoot.require()` to require a package. This is identical to the CommonJS `require` except it checks all requires against the `fastbootDependencies` whitelist.

Example:

```javascript
let path = FastBoot.require('path');
let filePath = path.join('tmp', session.getID());
```

If you attempt to require a package that is not in the whitelist, FastBoot will raise an exception.

The `FastBoot` global is **only** available when running in FastBoot mode. You should either guard against its absence or only use it in FastBoot-only initializers.

## FastBoot Service

FastBoot registers the `fastboot` [service](https://github.com/ember-fastboot/ember-cli-fastboot/blob/master/app/services/fastboot.js) which you can inject into your application:

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),
  isFastBoot: Ember.computed.reads('fastboot.isFastBoot'),

  // ... Application code
});
```

Property         | Description
---------------- | ---------------------------------------------------------------------------------------------------------
`isFastBoot`     | Equals `true` if your application is running in FastBoot
`response`       | The FastBoot server's response
`request`        | The request sent to the FastBoot server
`shoebox`        | A key/value store for passing data acquired server-side to the client
`deferRendering` | A function that takes a `Promise` that you can use to defer the Ember Applications rendering in FastBoot.

### Deferring Response Rendering

By default, FastBoot waits for the `beforeModel`, `model`, and `afterModel` hooks to resolve before sending a response back to the client.

If you have asynchronous code that runs outside of these lifecycle hooks, will want to use `deferRendering` to block the response. `deferRendering` function accepts a `Promise` and will chain all promises passed to it. FastBoot will wait for these promises to resolve before sending the response to the client.

You must call `deferRendering` before these model hooks complete. For example, if you made an asynchronous call in a Component, you would use `deferRendering` in the `init` lifecycle hook.

### FastBoot Request

The `fastboot.request` key allows you access to the request sent to the FastBoot server.

#### Cookies

You can access cookies for the current request via `fastboot.request` in the `fastboot` service.

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let authToken = this.get('fastboot.request.cookies.auth');
    // ...
  }
});
```

The FastBoot service's `cookies` property is an object containing the request's cookies as key/value pairs.

#### Headers

You can access the current request headers via `fastboot.request`. The `headers` object implements part of the [Fetch API's Headers class](https://developer.mozilla.org/en-US/docs/Web/API/Headers), the functions available are [`has`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/has), [`get`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/get), and [`getAll`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/getAll).

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let headers = this.get('fastboot.request.headers');
    let xRequestHeader = headers.get('X-Request');
    // ...
  }
});
```

#### Host

You can access the host of the request that the current FastBoot server is responding to via `fastboot.request` in the `fastboot` service. The `host` property will return the full `hostname` and `port` (`example.com` or `localhost:3000`).

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let host = this.get('fastboot.request.host');
    // ...
  }
});
```

Retrieving `host` will error on 2 conditions:

1. You do not have a `hostWhitelist` defined.
2. The `Host` header does not match an entry in your `hostWhitelist`.

##### The Host Whitelist

For security, you must specify a `hostWhitelist` of expected hosts in your application's `config/environment.js`:

```javascript
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

`hostWhitelist` entries can be a `String` or `RegExp` to match multiple hosts.

##### Security

Be careful with `RegExp` entries because host names are checked against the `Host` HTTP header, which can be forged. An improperly constructed `RegExp` could open your FastBoot servers and any backend they use to malicious requests.

#### Query Parameters

You can access query parameters for the current request via `fastboot.request` in the `fastboot` service.

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let authToken = this.get('fastboot.request.queryParams.auth');
    // ...
  }
});
```

The service's `queryParams` property is an object containing the request's query parameters as key/value pairs.

#### Path

You can access the path (`/` or `/some-path`) of the request that the current FastBoot server is responding to via `fastboot.request` in the `fastboot` service.

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let path = this.get('fastboot.request.path');
    // ...
  }
});
```

#### Protocol

You can access the protocol (`http` or `https`) of the request that the current FastBoot server is responding to via `fastboot.request` in the `fastboot` service.

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let protocol = this.get('fastboot.request.protocol');
    // ...
  }
});
```

### FastBoot Response

FastBoot Response gives you access to the response metadata that FastBoot will send back the client.

#### Headers

You can access the current response headers via `fastboot.response.headers`. The `headers` object implements part of the [Fetch API's Headers class](https://developer.mozilla.org/en-US/docs/Web/API/Headers), the functions available are [`has`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/has), [`get`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/get), and [`getAll`](https://developer.mozilla.org/en-US/docs/Web/API/Headers/getAll).

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model() {
    let isFastBoot = this.get('fastboot.isFastBoot');

    if (isFastBoot) {
      let resHeaders = this.get('fastboot.response.headers');
      resHeaders.set('X-Debug-Response-Type', 'fastboot');
    }
    // ...
  }
});
```

#### Status Code

You can access the status code of the current response via `fastboot.response.statusCode`. This is useful if you want your application to return a non-default (`200`) status code to the client. For example if you want a route of application to be `401 - Unauthorized` if it accessed without OAuth credentials, you could use `statusCode` to do that.

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  beforeModel() {
    let isFastBoot = this.get('fastboot.isFastBoot');

    if (!isFastBoot) {
      return;
    }

    let reqHeaders = this.get('fastboot.request.headers');
    let authHeaders = reqHeaders.get('Authorization');

    if (authHeaders === null) {
      this.set('fastboot.response.statusCode', 401);
    }
    // ...
  }
});
```

FastBoot handles `200`, [`204` and `3xx`](https://github.com/ember-fastboot/fastboot/blob/b62e795c8c21c4a5dca09f2cf20e4367c843fc7b/src/result.js#L27-L43) by default. For other custom responses you will want to modify your application and FastBoot server implementation to act accordingly.

### The Shoebox

The Shoebox lets you pass application state from your FastBoot rendered application to the browser for client-side rendering. For example if your FastBoot server makes an API request, you can use the Shoebox to pass to the client's browser. When the application resumes rendering on the client-side, it will be able to use that data, eliminating the need for it to make an API request of its own.

The contents of the Shoebox are written to the HTML as strings within `<script>` tags by the server rendered application, which are then consumed by the browser rendered application.

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

#### Putting and Retrieving

`shoebox.put` lets you add items to the Shoebox.

`shoebox.retrieve` lets you remove items from the Shoebox.

In the example below we find and store our data in a `shoeboxStore` object, when the application is rendered in FastBoot. When the same code is then executed by the client browser, we retrieve the items from the `shoeboxStore` rather than redoing the the find (and triggering a network request).

```javascript
export default Ember.Route.extend({
  fastboot: Ember.inject.service(),

  model(params) {
    let shoebox = this.get('fastboot.shoebox');
    let shoeboxStore = shoebox.retrieve('my-store');
    let isFastBoot = this.get('fastboot.isFastBoot');

    if (isFastBoot) {
      return this.store.findRecord('post', params.post_id).then(post => {
        if (!shoeboxStore) {
          shoeboxStore = {};
          shoebox.put('my-store', shoeboxStore);
        }
        shoeboxStore[post.id] = post.toJSON();
      });
    }

    return shoeboxStore && shoeboxStore.retrieve(params.post_id);
  }
});
```

## Disabling Incompatible Dependencies

For FastBoot, you will want to disable Node-incompatible JavaScript libraries. It is easiest to do this at build time.

There are two places where Ember allows third-party JavaScript to be included:

1. For applications: `app.import` in `ember-cli-build.js`
2. For addons: `app.import` in the `included` hook

`ember-cli-fastboot` sets the `EMBER_CLI_FASTBOOT` environment variable when it is building the FastBoot version of the application. You can use this to exclude incompatible libraries at build time:

```javascript
if (!process.env.EMBER_CLI_FASTBOOT) {
  // This will only be included in the browser build
  app.import('some/jquery.plugin.js')
}
```

## Tips and Tricks

### Designing Components

#### Use `didInsertElement` for client-side DOM manipulation

In FastBoot, we do not invoke either `didInsertElement` or `willInsertElement` hooks. If your components have any direct DOM manipulation you would do it in those hooks.

#### Lifecycle Hooks in FastBoot

FastBoot calls the `init`, `didReceiveAttrs`, `didUpdateAttrs`, `willRender` and `willUpdate`. Any code in these hooks will be run inside of FastBoot and should be free of references to browser APIs or DOM manipulation.

### Avoid jQuery

FastBoot relies on [`Ember.ApplicationInstance`](http://emberjs.com/api/classes/Ember.ApplicationInstance.html) to execute your Ember applicaiton on the server. jQuery is [disabled](https://github.com/emberjs/ember.js/blob/v2.7.0/packages/ember-application/lib/system/application-instance.js#L370) by default for these instances because most of jQuery depends on having full DOM access.

### Use `ember-network` for XHR requests

If you are depending on jQuery for XHR requests, use [ember-network](https://github.com/tomdale/ember-network) and replace your `$.ajax` calls with `fetch` calls.

## Troubleshooting in Node.js

Because your app is now running in Node.js, not the browser, you will need a new set of tools to help diagnose problems.

### Verbose Logging

Enable verbose logging by running the FastBoot server with the following environment variables set:

```sh
DEBUG=ember-cli-fastboot:* ember fastboot
```

Pull requests for adding or improving logging facilities are very welcome.

### Using Node Inspector with Developer Tools

You can get a debugging environment similar to the Chrome developer tools running with a FastBoot app, although it's not (yet) as easy as in the browser.

First, install the Node Inspector:

```sh
npm install node-inspector -g
```

Next, start the inspector server. Using the `--no-preload` flag is recommended. It waits to fetch the source code for a given file until it's actually needed.

```sh
node-inspector --no-preload
```

Once the debug server is running, you'll want to start up the FastBoot server with Node in debug mode. One thing about debug mode: it makes everything much slower. Since the `ember fastboot` command does a full build when launched, this becomes agonizingly slow in debug mode.

### Speeding up Server-side Debugging

Avoid the slowness by manually running the build in normal mode, then run FastBoot in debug mode without doing a build:

```sh
ember build && node --debug-brk ./node_modules/.bin/ember fastboot --no-build
```

This does a full rebuild and then starts the FastBoot server in debug mode.

Note that the `--debug-brk` flag will cause your app to start paused to give you a chance to open the debugger.

Once you see the output `debugger listening on port 5858`, visit <http://127.0.0.1:8080/debug?port=5858> in your browser. Once it loads, click the "Resume script execution" button (it has a ▶︎ icon) to let FastBoot continue loading.

Assuming your app loads without an exception, after a few seconds you will see a message that FastBoot is listening on port 3000\. Once you see that, you can open a connection. Any exceptions should be logged in the console, and you can use the tools you'd expect such as `console.log`, `debugger` statements, etc.

## Tests

Run the automated tests by running `npm test`.

Note that the integration tests create new Ember applications via `ember new` and thus have to run an `npm install`, which can take several minutes, particularly on slow connections.

To speed up test runs you can run `npm run test:precook` to "precook" a `node_modules` directory that will be reused across test runs.

### Debugging Integration Tests

Run the tests with the `DEBUG` environment variable set to `fastboot-test` to see verbose debugging output.

```sh
DEBUG=fastboot-test npm test
```
