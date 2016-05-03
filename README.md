# FastBoot

[![Build Status](https://travis-ci.org/ember-fastboot/ember-fastboot-server.svg?branch=master)](https://travis-ci.org/ember-fastboot/ember-fastboot-server)

FastBoot is a library for rendering Ember.js applications in Node.js.

For more information about FastBoot, see
[www.ember-fastboot.com][ember-fastboot], the Ember CLI addon that's a
prerequisite for developing FastBoot apps.

[ember-fastboot]: https://www.ember-fastboot.com

To serve server-rendered versions of your Ember app over HTTP, see the
[FastBoot App
Server](https://github.com/ember-fastboot/fastboot-app-server).

FastBoot requires Node v4 or later.

## Usage

```js
const FastBoot = require('fastboot');

let app = new FastBoot({
  distPath: 'path/to/dist'
});

app.visit('/photos');
```

In order to get a `dist` directory, you will first need to build your
Ember application, which packages it up for using in both the browser
and in Node.js.

### Build Your App

To get your Ember.js application ready to both run in your user's
browsers and run inside the FastBoot environment, run the Ember CLI
build command:

```sh
$ ember build --environment production
```

(You will need to have already set up the Ember CLI FastBoot addon. For
more information, see the [FastBoot quickstart][quickstart].)

[quickstart]: https://www.ember-fastboot.com/quickstart

Once this is done, you will have a `dist` directory that contains the
multi-environment build of your app. Upload this file to your FastBoot
server.

### Command Line

You can start a simple HTTP server that responds to incoming requests by
rendering your Ember.js application using the `ember-fastboot` command:

```
$ ember-fastboot path/to/dist --port 80
```

### Middleware

Alternatively, you can integrate the FastBoot server into an existing
Node.js application by constructing a `FastBootServer` and using it as a
middleware.

```js
var server = new FastBootServer({
  distPath: 'path/to/dist'
});

var app = express();

app.get('/*', server.middleware());

var listener = app.listen(process.env.PORT || 3000, function() {
  var host = listener.address().address;
  var port = listener.address().port;

  console.log('FastBoot running at http://' + host + ":" + port);
});
```

You can also serve Ember's static assets (compiled JavaScript and CSS files) or public
files (like images or fonts) without using a CDN by adding extra routes:

```js
app.use('/assets', express.static('dist/assets'));
app.use('/images', express.static('dist/images'));
app.use('/fonts', express.static('dist/fonts'));
app.get('/*', server.middleware());
```
