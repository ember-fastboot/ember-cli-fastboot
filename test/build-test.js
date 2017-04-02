var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));

var glob = require('glob');

var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

describe('it builds', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('dummy');
  });

  it("builds into dist by default", function() {
    return app.runEmberCommand('build')
      .then(function() {
        expect(app.filePath('dist/index.html')).to.be.a.file();
        expect(app.filePath('dist/assets/dummy.js')).to.be.a.file();
        expect(app.filePath('dist/assets/vendor.js')).to.be.a.file();
        expect(app.filePath('dist/index.html')).to.have.content.that.match(
          /<!-- EMBER_CLI_FASTBOOT_BODY -->/
        );
        expect(app.filePath('dist/assets/dummy-fastboot.js')).to.be.a.file();
      });
  });

  it("produces a production build with --environment=production", function() {
    return app.runEmberCommand('build', '--environment=production')
      .then(function() {
        expect(app.filePath('dist/index.html')).to.be.a.file();

        expect(find('dist/assets/vendor-*.js')).to.be.a.file();
        expect(find('dist/assets/vendor-*.js')).to.match(/vendor-\w{32}/, 'file name should contain MD5 fingerprint');

        expect(app.filePath('dist/index.html')).to.have.content.that.match(
          /<!-- EMBER_CLI_FASTBOOT_BODY -->/
        );

        expect(find('dist/assets/dummy-fastboot-*.js')).to.be.a.file();
        expect(find('dist/assets/dummy-fastboot-*.js')).to.match(/dummy-fastboot-\w{32}/, 'file name should contain MD5 fingerprint');
      });
  });

  function find(globPath) {
    globPath = app.filePath(globPath);
    var files = glob.sync(globPath);

    expect(files.length).to.equal(1, globPath);

    return files[0];
  }

});
