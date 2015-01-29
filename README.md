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
ember install:addon ember-cli-fastboot
```

## Running

* `ember fastboot`
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

Because Node does not offer a full DOM, we are not able to evaluate
components' `didInsertElement` hook when running in FastBoot mode.

Unfortunately, due to a limitation of the current implementation\*,
if you have any `didInsertElement` hooks in a component or view, the app
will just crash.

\*_The current limitation is that we have not figured out how to disable it yet._

### No `link-to`

The current `LinkView` implementation relies on having access to DOM.
Fixing this is next on our list so soon this section of the README will
be lost to the sands of time.

### No `index.html`

Built apps evaluated traditionally in the browser render your
`application` template into the document body you supply in
`app/index.html`.

Currently, FastBoot just renders your app with the `application`
template's `<div>` as the root element. Fortunately browsers are
resilient to this, but it's an obvious oversight we'll fix shortly.

### No JavaScript Served

Right now, this is only useful for creating an HTML representation of
your app at a particular route and serving it statically. Eventually, we
will support *also* serving the JavaScript payload, which can takeover
once it has finished loading and making the app fully interactive.

In the meantime, this is probably only useful for cURL or search
crawlers.
