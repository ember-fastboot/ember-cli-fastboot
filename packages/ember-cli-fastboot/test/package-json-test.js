'use strict';

const chai         = require('chai');
const expect       = chai.expect;
const fs           = require('fs-extra');
const path         = require('path');
const AddonTestApp = require('ember-cli-addon-tests').AddonTestApp;

chai.use(require('chai-fs'));

describe('generating package.json', function() {
  this.timeout(300000);

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
});

