'use strict';

const chai         = require('chai');
const expect       = chai.expect;
const fs           = require('fs-extra');
const path         = require('path');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

chai.use(require('chai-fs'));

describe('generating package.json', function() {
  this.timeout(300000);

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

    it('respects individual files being excluded from fingerprinting', function() {
      expect(customApp.filePath('dist/totally-customized-asset-map.json')).to.be.a.file();

      let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
      let manifest = pkg.fastboot.manifest;

      // customized-fingerprinting-fastboot.js is excluded from fingerprinting
      expect(manifest.appFiles).to.include('assets/customized-fingerprinting-fastboot.js');
      // vendor.js is excluded from fingerprinting
      expect(manifest.vendorFiles).to.include('assets/vendor.js');
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

      expect(manifest.appFiles).to.include('some-assets/path/app-file.js');
      manifest.appFiles.forEach(function(file) {
        expect(p(file)).to.be.a.file();
      });
      expect(p(manifest.htmlFile)).to.be.a.file();

      expect(manifest.vendorFiles).to.include('some-assets/path/lib.js');
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
    pkg['devDependencies']['fake-addon'] = `*`;
    pkg['devDependencies']['fake-addon-2'] = `*`;
    pkg['fastbootDependencies'] = ["rsvp"];
    pkg['dependencies'] = {
      rsvp: '3.2.1',
      'ember-fastboot-build-example': '0.1.2'
    };
  });
}
