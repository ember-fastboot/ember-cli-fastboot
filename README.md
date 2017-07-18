# FastBoot Express Middleware

[![Greenkeeper badge](https://badges.greenkeeper.io/ember-fastboot/fastboot-express-middleware.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/ember-fastboot/fastboot-express-middleware.svg?branch=master)](https://travis-ci.org/ember-fastboot/fastboot-express-middleware)

This middleware is a small wrapper around the
[fastboot](https://github.com/ember-fastboot/fastboot) package, which
renders Ember.js apps in Node.js.

By adding this middleware to your Express app, you can serve HTML from a
rendered Ember.js app to clients that don't support JavaScript, such as
`curl`, search crawlers, or users with JavaScript disabled.

Note that this is _just an Express middleware_ and there is more needed
to serve apps in a production environment. If you want to server-side
rendered Ember applications without doing a lot of work, you are
recommended to consider the [FastBoot App
Server](https://github.com/ember-fastboot/fastboot-app-server), which
manages many of the hard parts for you.

That said, this middleware is designed to be easy to integrate for those
who already have existing Express stacks, or who want maximum
flexibility in how requests are handled.

## Usage

```js
const express = require('express');
const fastbootMiddleware = require('fastboot-express-middleware');

let app = express();

app.get('/*', fastbootMiddleware('/path/to/dist'));

app.listen(3000, function () {
  console.log('FastBoot app listening on port 3000!');
});
```

## Building Your Ember App

Before you can use your app with FastBoot, you must first install the
[ember-cli-fastboot][ember-cli-fastboot] addon and build your app by
running `ember build`. The build process will compile your app into a
version that is compatible with both Node.js and the browser and put it
in the `dist` directory. This `dist` directory is the path you should
provide to the middleware to specify which Ember app to load and render.

## Resilient Mode

By default, errors during render will cause the middleware to send an
HTTP 500 status code as the response. In order to swallow errors and
return a `200` status code  with an empty HTML page, set the `resilient` flag to
true:

```js
app.get('/*', fastbootMiddleware('/path/to/dist', {
  resilient: true
}));
```

Resilient mode still calls `next(err)` to propagate your error to any subsequent
middleware that you apply after this one.
You can use this feature to track errors or log analytics.

However, because FastBoot is reslient still sends the response to the client.
***You cannot alter the `response`*** with any of your post-fastboot middleware.

## Custom FastBoot Instance

For more control over the FastBoot instance that is created to render
the Ember app, you can pass a custom instance that the middleware will
use instead of creating its own:

```js
let fastboot = new FastBoot({
  distPath: 'path/to/dist'
});

let middleware = fastbootMiddleware({
  fastboot: fastboot
});

app.get('/*', middleware);

// ...later
fastboot.reload();
```

[ember-cli-fastboot]: https://github.com/ember-fastboot/ember-cli-fastboot

## Tests

`npm test`
