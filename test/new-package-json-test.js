'use strict';

const expect = require('chai').expect;
const helpers = require('broccoli-test-helper');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;
const co = require('co');
const FastbootConfig = require('../lib/broccoli/fastboot-config');

describe('FastbootConfig', function() {
  let input;
  let output;
  let subject;
  let project;

  beforeEach(co.wrap(function* () {
    input = yield createTempDir();
    project = {
      addons: [ ],
      pkg:    { }
    };
    subject = new FastbootConfig(input.path(), {
      project,
      outputPaths: {
        app: { js: 'app.js' },
        vendor: { js: 'vendor.js' }
      }
    });
    output = createBuilder(subject);
  }));

  afterEach(co.wrap(function* () {
    yield input.dispose();
    yield output.dispose();
  }));

  it('it builds only when information changes', co.wrap(function* () {
    input.write({
      'index.js': `export { A } from "./lib/a";`,
      'lib': {
        'a.js': `export class A {};`,
        'b.js': `export class B {};`,
        'c.js': `export class C {};`
      }
    });

    yield output.build();

    expect(
      output.read()
    ).to.deep.equal({
      'package.json': `{"dependencies":{},"fastboot":{"manifest":{"appFiles":["assets/app.js","assets/app-fastboot.js"],"htmlFile":"index.html","vendorFiles":["assets/vendor.js"]},"moduleWhitelist":[],"schemaVersion":2}}`
    });

    yield output.build();

    expect(
      output.changes()
    ).to.deep.equal({ });

    project.pkg.fastbootDependencies = [
      'apple',
      'orange'
    ];

    project.pkg.dependencies = {
      apple: '*',
      orange: '^1.0.0',
      pizza: '^1.0.0'
    };

    yield output.build();

    expect(
      output.changes()
    ).to.deep.equal({
      'package.json': 'change'
    });

    expect(
      output.read()
    ).to.deep.equal({
      'package.json': `{"dependencies":{"apple":"*","orange":"^1.0.0"},"fastboot":{"manifest":{"appFiles":["assets/app.js","assets/app-fastboot.js"],"htmlFile":"index.html","vendorFiles":["assets/vendor.js"]},"moduleWhitelist":["apple","orange"],"schemaVersion":2}}`
    });

project.pkg.fastbootDependencies = [
      'apple',
      'orange'
    ];

    project.pkg.dependencies.pizza = '^3.0.0';

    yield output.build();

    expect(
      output.changes()
    ).to.deep.equal({ });

    project.pkg.dependencies.apple = '^3.0.0';

    yield output.build();

    expect(
      output.read()
    ).to.deep.equal({
      'package.json': `{"dependencies":{"apple":"^3.0.0","orange":"^1.0.0"},"fastboot":{"manifest":{"appFiles":["assets/app.js","assets/app-fastboot.js"],"htmlFile":"index.html","vendorFiles":["assets/vendor.js"]},"moduleWhitelist":["apple","orange"],"schemaVersion":2}}`
    });
  }));
});
