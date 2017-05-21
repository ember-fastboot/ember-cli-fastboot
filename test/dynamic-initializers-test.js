'use strict';

const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-fs'));

const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('dynamic initializers', function() {
  this.timeout(300000);

  let  app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dynamic-initializers')
      .then(function() {
        return app.runEmberCommand('build');
      });
  });

  it('filters FastBoot initializers from browser build', function() {
    let appPath = app.filePath('dist/assets/dynamic-initializers.js');
    expect(appPath).to.not.have.content.that.match(
      /But I warn you, if you don't tell me that this means war/);
    expect(appPath).to.have.content.that.match(
      /Well, Prince, so Genoa and Lucca are now just family estates/);
  });

  it('filters browser initializers from FastBoot build', function() {
    let appPath = app.filePath('dist/assets/dynamic-initializers-fastboot.js');
    expect(appPath).to.have.content.that.match(
      /But I warn you, if you don't tell me that this means war/);
    expect(appPath).to.not.have.content.that.match(
      /Well, Prince, so Genoa and Lucca are now just family estates/);
  });

  it('filters FastBoot instance initializers from browser build', function() {
    let appPath = app.filePath('dist/assets/dynamic-initializers.js');
    expect(appPath).to.not.have.content.that.match(/It was in July, 1805/);
    expect(appPath).to.have.content.that.match(/But how do you do/);
  });

  it('filters browser instance initializers from FastBoot build', function() {
    let appPath = app.filePath('dist/assets/dynamic-initializers-fastboot.js');
    expect(appPath).to.have.content.that.match(/It was in July, 1805/);
    expect(appPath).to.not.have.content.that.match(/But how do you do/);
  });
});
