# How To Contribute

It is always welcome to contribute to FastBoot project! Don't hesitate to open issues, submit PRs, or [chat with community](https://emberjs.com/community) for questions or help.

## Code of Conduct
[Ember Community Guidelines](https://emberjs.com/guidelines/)

## Code organization

This project is organized in a monorepo, you can find the packages published to npm under `packages/` folder:
- `fastboot`
- `ember-cli-fastboot`
- `fastboot-app-server`
- `fastboot-express-middleware`

The `test-packages` folder contains sample apps and integration test suite used for testing the published packages.

## Installation

* `git clone https://github.com/ember-fastboot/ember-cli-fastboot/`
* `cd ember-cli-fastboot`
* `pnpm install`

## Running tests

If you want to **all** the tests you can run 

```
pnpm test
```

in the root of the monorepo. You will see that it is calling `npm-run-all` on other scripts listed in `package.json` with the prefix `test:` so if you want to run any specific test again you can just use that package.json sript

## Where to write test

The packages in this monorepo are tightly integrated, consider these when writing new tests:

* Unit testing individual package: add to the package's own `test` folder
* Integration test that involve multiple packages: add to `test-packages/integration-tests`
* Testing FastBoot rendered sample app as `ember-cli-fastboot` consumer: add to `test-packages/<the-sample-app>/test`
