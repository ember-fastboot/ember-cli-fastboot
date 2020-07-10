'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const execa = require("execa");

chai.use(require('chai-fs'));

describe('generating package.json', function () {
  this.timeout(50000);

  describe('with customized outputPaths options', function () {
    // Tests an app with a custom `outputPaths` set
    before(async function () {
      await execa("yarn", ["build"]);
    });

    it('respects custom output paths and maps to them in the manifest', function () {
      let pkg = fs.readJSONSync('dist/package.json');
      let manifest = pkg.fastboot.manifest;

      expect(manifest.appFiles).to.include('some-assets/path/app-file.js');
      manifest.appFiles.forEach(function (file) {
        expect(`dist/${file}`).to.be.a.file();
      });
      expect(`dist/${manifest.htmlFile}`).to.be.a.file();

      expect(manifest.vendorFiles).to.include('some-assets/path/lib.js');
      manifest.vendorFiles.forEach(function (file) {
        expect(`dist/${file}`).to.be.a.file();
      });
    });
  });
});
