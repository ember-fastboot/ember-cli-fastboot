'use strict';

const chai         = require('chai');
const expect       = chai.expect;
const fs           = require('fs-extra');
const path         = require('path');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

chai.use(require('chai-fs'));

describe('generating package.json', function() {
  this.timeout(300000);

  let app;

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
      return app.runEmberCommand('build');
    });

    it('builds a package.json', function() {
      expect(app.filePath('dist/package.json')).to.be.a.file();
    });

    it('merges FastBoot dependencies from multiple addons', function() {
      let config = fs.readJsonSync(app.filePath('/dist/package.json'));

      expect(config.dependencies).to.deep.equal({
        'foo': '1.0.0',
        'bar': '^0.1.2',
        'baz': '0.0.0',
        'rsvp': '3.2.1'
      });
    });

    it('contains a schema version', function() {
      let pkg = fs.readJsonSync(app.filePath('/dist/package.json'));

      expect(pkg.fastboot.schemaVersion).to.deep.equal(2);
    });

    it('contains a whitelist of allowed module names', function() {
      let pkg = fs.readJsonSync(app.filePath('/dist/package.json'));

      expect(pkg.fastboot.moduleWhitelist).to.deep.equal([
        'path',
        'foo',
        'bar',
        'baz',
        'rsvp'
      ]);
    });

    it('contains a manifest of FastBoot assets', function() {
      let pkg = fs.readJsonSync(app.filePath('/dist/package.json'));

      expect(pkg.fastboot.manifest).to.deep.equal({
        appFiles: ['assets/module-whitelist.js', 'assets/module-whitelist-fastboot.js', 'ember-fastboot-build-example/bar.js'],
        htmlFile: 'index.html',
        vendorFiles: ['ember-fastboot-build-example/foo.js', 'assets/vendor.js']
      });
    });

    it('contains a list of whitelisted hosts from environment.js', function() {
      let pkg = fs.readJsonSync(app.filePath('dist/package.json'));

      expect(pkg.fastboot.hostWhitelist).to.deep.equal([
        'example.com',
        'subdomain.example.com',
        '/localhost:\\d+/'
      ]);
    });

    it('contains the application config', function() {
      let pkg = fs.readJsonSync(app.filePath('dist/package.json'));

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
      return app.runEmberCommand('build', '--environment=production');
    });

    // https://github.com/tildeio/ember-cli-fastboot/issues/102
    // production builds have a fingerprint added to them, which was not being
    // reflected in the manifest
    it('contains a manifest of FastBoot assets', function() {
      let pkg = fs.readJsonSync(app.filePath('/dist/package.json'));

      let p = function(filePath) {
        return app.filePath(path.join('dist', filePath));
      };

      let manifest = pkg.fastboot.manifest;

      manifest.appFiles.forEach(function(file) {
        expect(p(file)).to.be.a.file();
      });
      expect(p(manifest.htmlFile)).to.be.a.file();
      manifest.vendorFiles.forEach(function(file) {
        expect(p(file)).to.be.a.file();
      });
    });
  });

  describe('with customized fingerprinting options', function() {
    // Tests an app with a custom `assetMapPath` set
    let customApp = new AddonTestApp();

    before(function() {
      return customApp.create('customized-fingerprinting')
        .then(function() {
          return customApp.runEmberCommand('build', '--environment=production');
        });
    });

    it('respects a custom asset map path and prepended URLs', function() {
      expect(customApp.filePath('dist/totally-customized-asset-map.json')).to.be.a.file();

      function p(filePath) {
        return customApp.filePath(path.join('dist', filePath));
      }

      let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
      let manifest = pkg.fastboot.manifest;

      manifest.appFiles.forEach(function(file) {
        expect(p(file)).to.be.a.file();
      });
      expect(p(manifest.htmlFile)).to.be.a.file();
      manifest.vendorFiles.forEach(function(file) {
        expect(p(file)).to.be.a.file();
      });
    });
  });

  describe('with customized outputPaths options', function() {
    // Tests an app with a custom `outputPaths` set
    let customApp = new AddonTestApp();

    before(function() {
      return customApp.create('customized-outputpaths')
        .then(function() {
          return customApp.runEmberCommand('build');
        });
    });

    it('respects custom output paths and maps to them in the manifest', function() {
      function p(filePath) {
        return customApp.filePath(path.join('dist', filePath));
      }

      let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
      let manifest = pkg.fastboot.manifest;

      manifest.appFiles.forEach(function(file) {
        expect(p(file)).to.be.a.file();
      });
      expect(p(manifest.htmlFile)).to.be.a.file();
      manifest.vendorFiles.forEach(function(file) {
        expect(p(file)).to.be.a.file();
      });
    });
  });

  describe('with custom htmlFile', function() {
    this.timeout(300000);

    let customApp = new AddonTestApp();

    before(function() {
      return customApp.create('custom-html-file')
        .then(function() {
          return customApp.runEmberCommand('build', '--environment=production');
        });
    });

    it('uses custom htmlFile in the manifest', function() {
      function p(filePath) {
        return customApp.filePath(path.join('dist', filePath));
      }

      let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
      let manifest = pkg.fastboot.manifest;

      expect(manifest.htmlFile).to.equal('custom-index.html');
      expect(p(manifest.htmlFile)).to.be.a.file();
    });
  });
});

function addFastBootDeps(app) {
  return app.editPackageJSON(pkg => {
    pkg['devDependencies']['fake-addon'] = '*';
    pkg['devDependencies']['fake-addon-2'] = '*';
    pkg['fastbootDependencies'] = ["rsvp"];
    pkg['dependencies'] = {
      rsvp: '3.2.1',
      'ember-fastboot-build-example': '0.1.1'
    };
  });
}
