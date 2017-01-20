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
        "foo": "1.0.0",
        "bar": "^0.1.2",
        "baz": "0.0.0",
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

    it("contains the application config", function() {
      var pkg = fs.readJsonSync(app.filePath('dist/package.json'));

      expect(pkg.fastboot.appConfig).to.deep.equal({
        modulePrefix: 'module-whitelist',
        environment: 'development',
        baseURL: '/',
        locationType: 'auto',
        EmberENV: { FEATURES: {} },
        APP: { name: 'module-whitelist', version: '0.0.0+', autoboot: false },
        fastboot: { hostWhitelist: [ 'example.com', 'subdomain.example.com', {} ] },
        exportApplicationGlobal: true
      });
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

  describe('with customized outputPaths options', function() {
    // Tests an app with a custom `outputPaths` set
    var customApp = new AddonTestApp();

    before(function() {
      return customApp.create('customized-outputpaths')
        .then(function() {
          return customApp.run('ember', 'build', '--environment', 'production');
        });
    });

    it("respects custom output paths and maps to them in the manifest", function() {

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

  describe('with custom htmlFile', function() {
    this.timeout(300000);

    var customApp = new AddonTestApp();

    before(function() {
      return customApp.create('custom-html-file')
        .then(function() {
          return customApp.run('ember', 'build', '--environment', 'production');
        });
    });

    it("uses custom htmlFile in the manifest", function() {

      var p = function(filePath) {
        return customApp.filePath(path.join('dist', filePath));
      };

      var pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
      var manifest = pkg.fastboot.manifest;

      expect(manifest.htmlFile).to.equal('custom-index.html');
      expect(p(manifest.htmlFile)).to.be.a.file();
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
