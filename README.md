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

FastBoot requires Node.js v4 or later.

## Usage

```js
const FastBoot = require('fastboot');

let app = new FastBoot({
  distPath: 'path/to/dist'
});

app.visit('/photos')
  .then(result => result.html())
  .then(html => res.send(html));
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
