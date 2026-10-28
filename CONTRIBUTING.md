# Contributing

## Code organization

- `packages/fastboot`: the renderer for Node.js, the request handler, and the Vite plugin
- `packages/ember-cli-fastboot`: the Ember addon (browser boot, `fastboot` service, classic build hooks)
- `test-packages/classic-app`: a classic (ember-cli and broccoli) app for the tests
- `test-packages/vite-app`: a Vite app for the tests
- `tests`: the tests of the whole repository

The two test apps have the same routes, components, and templates.
When you change one, make the same change in the other.

## Set up

```sh
git clone https://github.com/ember-fastboot/ember-cli-fastboot.git
cd ember-cli-fastboot
pnpm install
pnpm exec playwright install chromium
```

## Test

```sh
pnpm test
```

The tests build both test apps first. That takes about 20 seconds.
To test the builds that are already on disk, set `SKIP_FIXTURE_BUILD=true`.

CI runs the tests with Node.js 22, 24, and 26.

## Lint

```sh
pnpm lint
pnpm lint:fix
```

## Release

See [RELEASE.md](RELEASE.md).
