# Ember FastBoot Server

The Ember FastBoot Server is used to render Ember.js applications on the
server and deliver them to clients over HTTP. This server is meant to be
run in a production environment.

For more information about FastBoot, see
[ember-cli-fastboot][ember-cli-fastboot], the Ember CLI addon that's a
prerequisite for developing FastBoot apps.

[ember-cli-fastboot]: https://github.com/tildeio/ember-cli-fastboot

## Usage

### Command Line

You can run the FastBoot server from the command line:

```
$ ember-fastboot \
    --port 80
    --app-file path/to/app-file.js
    --vendor-file path/to/vendor-file.js
    --html-file path/to/index.html
```

### Middleware

Alternatively, you can integrate the FastBoot server into an existing
Node.js application by constructing a `FastBootServer` and using it as a
middleware.

```js
var server = new FastBootServer({
  appFile: appFile,
  vendorFile: vendorFile,
  htmlFile: htmlFile,
  ui: ui
});

var app = express();

app.get('/*', server.middleware());

var listener = app.listen(options.port, function() {
  var host = listener.address().address;
  var port = listener.address().port;

  console.log('FastBoot running at http://' + host + ":" + port);
});
```
