# Ember FastBoot Server

[![Build Status](https://travis-ci.org/ember-fastboot/ember-fastboot-server.svg?branch=master)](https://travis-ci.org/ember-fastboot/ember-fastboot-server)

The Ember FastBoot Server is used to render Ember.js applications on the
server and deliver them to clients over HTTP. This server is meant to be
run in a production environment.

For more information about FastBoot, see
[www.ember-fastboot.com][ember-fastboot], the Ember CLI addon that's a
prerequisite for developing FastBoot apps.

[ember-fastboot]: https://www.ember-fastboot.com

The FastBoot server requires Node 0.12 or later.

## Usage

The FastBoot server supports two modes of usage:

1. Running as a binary from the command line.
2. Running programmatically as an Express middleware.

In both cases, you will first need to build your Ember application,
which packages it up for using in both the browser and in Node.js.

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
