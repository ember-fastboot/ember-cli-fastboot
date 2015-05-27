# Ember FastBoot

An Ember CLI addon that allows you to render and serve Ember.js apps on
the server. Using FastBoot, you can serve rendered HTML to browsers and
other clients without requiring them to download JavaScript assets.

Currently, the set of Ember applications supported is extremely limited.
As we fix more issues, we expect that set to grow rapidly. See [Known
Limitations](#known-limitations) below for a full-list.

The bottom line is that you should not (yet) expect to install this add-on in
your production app and have FastBoot work.

## Installation

From within your Ember CLI application, run the following command:

```
ember install ember-cli-fastboot
```

In order to get FastBoot working, you will first need to do the
following:

* Install Ember Canary and enable HTMLbars
* Set the router's location to NoneLocation

#### Install Ember Canary and Enable HTMLbars

To enable Ember canary and HTMLbars, run the following commands:

```
rm -rf bower_components
bower install --save ember#canary
bower install
```

Bower also prompts you to confirm various "resolutions" that it is
unsure of. Make sure you pick ember#canary if prompted.

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

## Known Limitations

While FastBoot is under active development, there are several major
restrictions you should be aware of. Only the most brave should even
consider deploying this to production.

### Requires Ember Canary

We are actively improving Ember.js to ensure that it loads and renders
correctly in environments without a DOM (notably Node.js in this case).

Because of that, FastBoot will require you to be running on a canary
version of Ember for the foreseeable future.

To run your app with canary, run the following command:

```js
bower install --save ember#canary
```

You will also need to ensure you have enabled HTMLbars. If you have not
done so, see [this blog post](http://reefpoints.dockyard.com/2014/11/30/htmlbars_calling_all_testers.html)
for steps on enabling HTMLbars in an Ember CLI application.

### No `didInsertElement`

Since `didInsertElement` hooks are designed to let your component
directly manipulate the DOM, and that doesn't make sense on the server
where there is no DOM, we do not invoke either `didInsertElement` nor
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
