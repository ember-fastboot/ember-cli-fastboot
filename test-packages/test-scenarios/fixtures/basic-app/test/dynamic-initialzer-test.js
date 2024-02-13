const chai = require('chai');
const expect = chai.expect;
const glob = require("glob");
const execa = require("execa");

chai.use(require('chai-fs'));

describe('dynamic initializers', function() {
  this.timeout(100000);

  before( async () => {
    await execa("yarn", ["build"]);
  });

  it('filters FastBoot initializers from browser build', function() {
    const appPath = find('dist/assets/basic-app.js');
    expect(appPath).to.not.have.content.that.match(
      /But I warn you, if you don't tell me that this means war/);

    expect(appPath).to.have.content.that.match(
      /Well, Prince, so Genoa and Lucca are now just family estates/);
  });

  it('filters browser initializers from FastBoot build', function() {
    const appPath = find('dist/assets/basic-app-fastboot.js');

    expect(appPath).to.have.content.that.match(
      /But I warn you, if you don't tell me that this means war/);
    expect(appPath).to.not.have.content.that.match(
      /Well, Prince, so Genoa and Lucca are now just family estates/);
  });

  it('filters FastBoot instance initializers from browser build', function() {
    const appPath = find('dist/assets/basic-app.js');
    expect(appPath).to.not.have.content.that.match(/It was in July, 1805/);
    expect(appPath).to.have.content.that.match(/But how do you do/);
  });

  it('filters browser instance initializers from FastBoot build', function() {
    const appFastbootPath = find('dist/assets/basic-app-fastboot.js');

    expect(appFastbootPath).to.have.content.that.match(/It was in July, 1805/);
    expect(appFastbootPath).to.not.have.content.that.match(/But how do you do/);
  });

  function find(globPath) {
    let files = glob.sync(globPath);

    expect(files.length).to.equal(1, globPath);

    return files[0];
  }
});
