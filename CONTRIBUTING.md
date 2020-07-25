# How To Contribute


### Code organization

The actual ember addon is in `./packages/ember-cli-fastboot`. We will be adding other `test-packages` to let us test with many different app scenarios with differing dependencies.


### Installation

* `git clone <repository-url>`
* `cd packages/ember-cli-fastboot`
* `yarn install`

## Running tests
* `cd packages/ember-cli-fastboot`
* `yarn test:mocha` – Runs the test suite on the current Ember version
* `yarn test:ember` – Runs the test suite on the current Ember version
* `yarn test:ember --server` – Runs the test suite in "watch mode"
