# ember-cli-fastboot

The Ember side of FastBoot:

- `boot()` from `ember-cli-fastboot/boot`: starts the app in the browser, and takes over a page that the server rendered
- the `fastboot` service: the request and response of a render
- `settled()` from `ember-cli-fastboot/settled`: for the SSR entry of a Vite app
- for classic apps: `ember serve` renders pages, and the app boots with `boot()`

To set up an app, read the [FastBoot README](../../README.md).
