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
* `yarn install`

## Running tests

* `yarn workspace integration-tests test` - Run integration test suite
* `yarn workspace basic-app test:mocha` - Run sample app's test suite
* `yarn workspace ember-cli-fastboot test:ember` – Runs the `ember-cli-fastboot` test suite

You can run each package's own test suite specified in its `package.json` via [`yarn workspace`](https://classic.yarnpkg.com/en/docs/cli/workspace#yarn-workspace-workspace_name-command-)

## Where to write test

The packages in this monorepo are tightly integrated, consider these when writing new tests:

* Unit testing individual package: add to the package's own `test` folder
* Integration test that involve multiple packages: add to `test-packages/integration-tests`
* Testing FastBoot rendered sample app as `ember-cli-fastboot` consumer: add to `test-packages/<the-sample-app>/test`
