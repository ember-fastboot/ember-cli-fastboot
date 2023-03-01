## `ember-fastboot-server` Deprecated

This GitHub repository used to be called `ember-fastboot-server` when
its responsibilities weren't clear. It was both a library for rendering
HTML in Node.js, an Express middleware, and a (rather poor) application
server.

Now, this repository is called `fastboot` and has a single focus:
programmatically allowing you to load and render Ember apps from
Node.js.

If you received a deprecation warning about `ember-fastboot-server`, you
should switch to the appropriate package that fits your needs. By
focusing on small modules that do one thing, we can do that one thing
better.

**Programmatic Rendering**: Use
[fastboot](https://github.com/ember-fastboot/fastboot).

**Express Middleware**: Use
[fastboot-express-middleware](https://github.com/ember-fastboot/fastboot-express-middleware).

**Application Server**, for hosting FastBoot apps over HTTP in
production: Use
[fastboot-app-server](https://github.com/ember-fastboot/fastboot-app-server).
