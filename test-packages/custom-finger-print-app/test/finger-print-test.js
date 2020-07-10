'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const execa = require("execa");

chai.use(require('chai-fs'));

describe('generating package.json', function () {
  this.timeout(50000);

  describe('with customized fingerprinting options', function () {
    // Tests an app with a custom `assetMapPath` set
    before(async function () {
      await execa("yarn", ["build:prod"]);
    });

    it('respects a custom asset map path and prepended URLs', function () {
      expect('dist/totally-customized-asset-map.json').to.be.a.file();

      let pkg = fs.readJSONSync('dist/package.json');
      let manifest = pkg.fastboot.manifest;

      manifest.appFiles.forEach(function (file) {
        expect(`dist/${file}`).to.be.a.file();
      });
      expect(`dist/${manifest.htmlFile}`).to.be.a.file();
      manifest.vendorFiles.forEach(function (file) {
        expect(`dist/${file}`).to.be.a.file();
      });
    });

    it('respects individual files being excluded from fingerprinting', function () {
      expect('dist/totally-customized-asset-map.json').to.be.a.file();

      let pkg = fs.readJSONSync('dist/package.json');
      let manifest = pkg.fastboot.manifest;

      // customized-fingerprinting-fastboot.js is excluded from fingerprinting
      expect(manifest.appFiles).to.include('assets/custom-finger-print-app-fastboot.js');
      // vendor.js is excluded from fingerprinting
      expect(manifest.vendorFiles).to.include('assets/vendor.js');
    });
  });
});
