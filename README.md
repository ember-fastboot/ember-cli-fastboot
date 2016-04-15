# Ember FastBoot Server

[![Build Status](https://travis-ci.org/ember-fastboot/ember-fastboot-server.svg?branch=master)](https://travis-ci.org/ember-fastboot/ember-fastboot-server)

The Ember FastBoot Server is used to render Ember.js applications on the
server and deliver them to clients over HTTP. This server is meant to be
run in a production environment.

For more information about FastBoot, see
[ember-cli-fastboot][ember-cli-fastboot], the Ember CLI addon that's a
prerequisite for developing FastBoot apps.

[ember-cli-fastboot]: https://github.com/tildeio/ember-cli-fastboot

The FastBoot server requires Node 0.12 or later.

## Usage

### Command Line

You can run the FastBoot server from the command line:

```
$ ember-fastboot path/to/fastboot-dist --port 80
```

### Middleware

Alternatively, you can integrate the FastBoot server into an existing
Node.js application by constructing a `FastBootServer` and using it as a
middleware.

```js
var server = new FastBootServer({
  distPath: 'path/to/fastboot-dist'
});

var app = express();

app.get('/*', server.middleware());

var listener = app.listen(process.env.PORT || 3000, function() {
  var host = listener.address().address;
  var port = listener.address().port;

  console.log('FastBoot running at http://' + host + ":" + port);
});
```
