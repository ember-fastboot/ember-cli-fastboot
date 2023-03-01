const chai = require('chai');
const expect = chai.expect;
const glob = require("glob");
const fs = require('fs-extra');
const execa = require("execa");

chai.use(require('chai-fs'));

describe('it builds', function() {
  this.timeout(100000);

  it('builds into dist by default', async function() {

    await execa("yarn", ["build"]);

    expect(find('dist/index.html')).to.be.a.file();
    expect(find('dist/assets/basic-app.js')).to.be.a.file();
    expect(find('dist/assets/vendor.js')).to.be.a.file();
    expect(find('dist/index.html')).to.have.content.that.match(
      /<!-- EMBER_CLI_FASTBOOT_BODY -->/
      );
    expect(find('dist/assets/basic-app-fastboot.js')).to.be.a.file();
  });

  it('produces a production build with --environment=production', async function () {

    await execa("yarn", ["build", "--environment=production"]);

    expect(find('dist/index.html')).to.be.a.file();
    expect(find('dist/assets/vendor-*.js')).to.be.a.file();
    expect(find('dist/assets/vendor-*.js')).to.match(/vendor-\w{32}/, 'file name should contain MD5 fingerprint');
    expect(find('dist/index.html')).to.have.content.that.match(
      /<!-- EMBER_CLI_FASTBOOT_BODY -->/
      );
    expect(find('dist/assets/basic-app-fastboot-*.js')).to.be.a.file();
    expect(find('dist/assets/basic-app-fastboot-*.js')).to.match(/basic-app-fastboot-\w{32}/, 'file name should contain MD5 fingerprint');
  });

  function find(globPath) {
    let files = glob.sync(globPath);

    expect(files.length).to.equal(1, globPath);

    return files[0];
  }
});