var chai = require('chai');
var expect = chai.expect;
chai.use(require('chai-fs'));

var glob = require('glob');

var AddonTestApp     = require('ember-cli-addon-tests').AddonTestApp;

describe('it builds', function() {
  this.timeout(300000);

  var app;

  before(function() {

    app = new AddonTestApp();

    return app.create('dummy');
  });

  it("builds into fastboot-dist by default", function() {
    return app.runEmberCommand('fastboot:build')
      .then(function() {
        expect(app.filePath('fastboot-dist/index.html')).to.be.a.file();
        expect(app.filePath('fastboot-dist/assets/dummy.js')).to.be.a.file();
        expect(app.filePath('fastboot-dist/assets/vendor.js')).to.be.a.file();
        expect(app.filePath('fastboot-dist/index.html')).to.have.content.that.match(
          /<!-- EMBER_CLI_FASTBOOT_BODY -->/
        );
      });
  });

  it("produces a production build with --environment=production", function() {
    return app.runEmberCommand('fastboot:build', '--environment=production')
      .then(function() {
        expect(app.filePath('fastboot-dist/index.html')).to.be.a.file();
        expect(find('fastboot-dist/assets/dummy-*.js')).to.be.a.file();
        expect(find('fastboot-dist/assets/dummy-*.js')).to.match(/dummy-\w{32}/, 'file name should contain MD5 fingerprint');

        expect(find('fastboot-dist/assets/vendor-*.js')).to.be.a.file();
        expect(find('fastboot-dist/assets/vendor-*.js')).to.match(/vendor-\w{32}/, 'file name should contain MD5 fingerprint');

        expect(app.filePath('fastboot-dist/index.html')).to.have.content.that.match(
          /<!-- EMBER_CLI_FASTBOOT_BODY -->/
        );
      });
  });

  function find(globPath) {
    globPath = app.filePath(globPath);
    var files = glob.sync(globPath);

    expect(files.length).to.equal(1, globPath);

    return files[0];
  }

});

