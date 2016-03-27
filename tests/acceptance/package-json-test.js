var chai         = require('chai');
var expect       = chai.expect;
var fs           = require('fs-extra');
var path         = require('path');
var AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

chai.use(require('chai-fs'));

describe('generating package.json', function() {
  this.timeout(300000);

  var app;

  before(function() {
    app = new AddonTestApp();

    return app.create('module-whitelist')
      .then(addFastBootDeps)
      .then(function() {
        return app.run('npm', 'install');
      });
  });

  describe('with FastBoot builds', function() {

    before(function() {
      return app.run('ember', 'build');
    });

    it('builds a package.json', function() {
      expect(app.filePath('dist/package.json')).to.be.a.file();
    });

    it("merges FastBoot dependencies from multiple addons", function() {
      var config = fs.readJsonSync(app.filePath('/dist/package.json'));

      expect(config.dependencies).to.deep.equal({
        "foo": "1.2.3",
        "bar": "^7.8.9",
        "baz": "0.2.0",
        "rsvp": "3.2.1"
      });
    });

    it("contains a whitelist of allowed module names", function() {
      var pkg = fs.readJsonSync(app.filePath('/dist/package.json'));

      expect(pkg.fastboot.moduleWhitelist).to.deep.equal([
        'path',
        'foo',
        'bar',
        'baz',
        'rsvp'
      ]);
    });

    it("contains a manifest of FastBoot assets", function() {
      var pkg = fs.readJsonSync(app.filePath('/dist/package.json'));

      expect(pkg.fastboot.manifest).to.deep.equal({
        appFile: 'fastboot/module-whitelist.js',
        htmlFile: 'index.html',
        vendorFile: 'fastboot/vendor.js'
      });
    });

    it("contains a list of whitelisted hosts from environment.js", function() {
      var pkg = fs.readJsonSync(app.filePath('dist/package.json'));

      expect(pkg.fastboot.hostWhitelist).to.deep.equal([
        'example.com',
        'subdomain.example.com',
        '/localhost:\\d+/'
      ]);
    });

  });

  describe('with production FastBoot builds', function() {

    before(function() {
      return app.run('ember', 'build', '--environment', 'production');
    });

    // https://github.com/tildeio/ember-cli-fastboot/issues/102
    // production builds have a fingerprint added to them, which was not being
    // reflected in the manifest
    it("contains a manifest of FastBoot assets", function() {
      var pkg = fs.readJsonSync(app.filePath('/dist/package.json'));

      var p = function(filePath) {
        return app.filePath(path.join('dist', filePath));
      };

      var manifest = pkg.fastboot.manifest;

      expect(p(manifest.appFile)).to.be.a.file();
      expect(p(manifest.htmlFile)).to.be.a.file();
      expect(p(manifest.vendorFile)).to.be.a.file();
    });
  });

  describe('with customized fingerprinting options', function() {
    // Tests an app with a custom `assetMapPath` set
    var customApp = new AddonTestApp();

    before(function() {
      return customApp.create('customized-fingerprinting')
        .then(function() {
          return customApp.run('ember', 'build', '--environment', 'production');
        });
    });

    it("respects a custom asset map path and prepended URLs", function() {
      expect(customApp.filePath('dist/totally-customized-asset-map.json')).to.be.a.file();

      var p = function(filePath) {
        return customApp.filePath(path.join('dist', filePath));
      };

      var pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
      var manifest = pkg.fastboot.manifest;

      expect(p(manifest.appFile)).to.be.a.file();
      expect(p(manifest.htmlFile)).to.be.a.file();
      expect(p(manifest.vendorFile)).to.be.a.file();
    });

  });

});

function addFastBootDeps(app) {
  return app.editPackageJSON(function(pkg) {
    pkg['devDependencies']['fake-addon'] = "*";
    pkg['devDependencies']['fake-addon-2'] = "*";
    pkg['fastbootDependencies'] = ["rsvp"];
    pkg['dependencies'] = {
      rsvp: "3.2.1"
    };
  });
}
