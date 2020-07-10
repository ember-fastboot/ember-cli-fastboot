'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const execa = require("execa");

chai.use(require('chai-fs'));

describe('generating package.json', function () {
  this.timeout(300000);

  describe('with addon that implements fastbootConfigTree', function () {

    before(async function () {
      await execa("yarn", ["build"]);
    });

    it('it extends the application config', function () {
      let pkg = fs.readJSONSync('dist/package.json');

      let config = pkg.fastboot.config["custom-app"];
      expect(config.APP.version).to.include("0.0.0");
      delete config.APP.version;

      expect(pkg.fastboot.config["custom-app"]).to.deep.equal({
        foo: "bar",
        modulePrefix: "custom-app",
        environment: "development",
        rootURL: "/",
        locationType: "auto",
        EmberENV: {
          EXTEND_PROTOTYPES: {
            Date: false,
          },
          FEATURES: {},
          _APPLICATION_TEMPLATE_WRAPPER: false,
          _DEFAULT_ASYNC_OBSERVERS: true,
          _JQUERY_INTEGRATION: false,
          _TEMPLATE_ONLY_GLIMMER_COMPONENTS: true,
        },
        APP: {
          name: "custom-app",
          autoboot: false,
        },
        fastboot: {
          hostWhitelist: [
            "example.com",
            "subdomain.example.com",
            "/localhost:\\d+/",
          ],
        },
        exportApplicationGlobal: true,
      });
    });
  });

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
      expect(manifest.appFiles).to.include('assets/custom-app-fastboot.js');
      // vendor.js is excluded from fingerprinting
      expect(manifest.vendorFiles).to.include('assets/vendor.js');
    });
  });

  // describe('with customized outputPaths options', function () {
  //   // Tests an app with a custom `outputPaths` set
  //   let customApp = new AddonTestApp();

  //   before(function () {
  //     return customApp.create('customized-outputpaths')
  //       .then(function () {
  //         return customApp.runEmberCommand('build');
  //       });
  //   });

  //   it('respects custom output paths and maps to them in the manifest', function () {
  //     function p(filePath) {
  //       return customApp.filePath(path.join('dist', filePath));
  //     }

  //     let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
  //     let manifest = pkg.fastboot.manifest;

  //     expect(manifest.appFiles).to.include('some-assets/path/app-file.js');
  //     manifest.appFiles.forEach(function (file) {
  //       expect(p(file)).to.be.a.file();
  //     });
  //     expect(p(manifest.htmlFile)).to.be.a.file();

  //     expect(manifest.vendorFiles).to.include('some-assets/path/lib.js');
  //     manifest.vendorFiles.forEach(function (file) {
  //       expect(p(file)).to.be.a.file();
  //     });
  //   });
  // });

  // describe('with custom htmlFile', function () {
  //   this.timeout(300000);

  //   let customApp = new AddonTestApp();

  //   before(function () {
  //     return customApp.create('custom-html-file')
  //       .then(function () {
  //         return customApp.runEmberCommand('build', '--environment=production');
  //       });
  //   });

  //   it('uses custom htmlFile in the manifest', function () {
  //     function p(filePath) {
  //       return customApp.filePath(path.join('dist', filePath));
  //     }

  //     let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
  //     let manifest = pkg.fastboot.manifest;

  //     expect(manifest.htmlFile).to.equal('custom-index.html');
  //     expect(p(manifest.htmlFile)).to.be.a.file();
  //   });
  // });
});
