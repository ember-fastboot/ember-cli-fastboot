'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const execa = require("execa");

chai.use(require('chai-fs'));

describe('generating package.json', function () {
  this.timeout(300000);

  describe('with FastBoot builds', function () {

    before(async function () {
      await execa("yarn", ["build"]);
    });

    it('builds a package.json', async function () {
      expect("dist/assets/basic-app.js").to.be.a.file();
      expect('dist/package.json').to.be.a.file();
    });

    it('merges FastBoot dependencies from multiple addons', function () {
      let pkg = fs.readJSONSync('dist/package.json');

      expect(pkg.dependencies).to.deep.equal({
        'abortcontroller-polyfill': '^1.4.0',
        'foo': '1.0.0',
        'bar': '^0.1.2',
        'baz': '0.0.0',
        'node-fetch': '^2.6.0',
        'rsvp': '3.2.1'
      });
    });

    it('contains a schema version', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      expect(pkg.fastboot.schemaVersion).to.deep.equal(3);
    });

    it('contains a whitelist of allowed module names', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      expect(pkg.fastboot.moduleWhitelist).to.deep.equal([
        "node-fetch",
        "abortcontroller-polyfill",
        "abortcontroller-polyfill/dist/cjs-ponyfill",
        "path",
        "foo",
        "bar",
        "baz",
        "rsvp",
      ]);
    });

    it('contains a manifest of FastBoot assets', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      expect(pkg.fastboot.manifest).to.deep.equal({
        appFiles: [
          "assets/basic-app.js",
          "assets/basic-app-fastboot.js",
          "ember-fastboot-build-example/bar.js",
        ],
        htmlFile: "index.html",
        vendorFiles: [
          "ember-fastboot-build-example/foo.js",
          "assets/vendor.js",
          "assets/auto-import-fastboot.js",
          "ember-fetch/fetch-fastboot.js",
        ],
      });
    });

    it('contains a list of whitelisted hosts from environment.js', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      expect(pkg.fastboot.hostWhitelist).to.deep.equal([
        'example.com',
        'subdomain.example.com',
        '/localhost:\\d+/'
      ]);
    });

    it('contains app name', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      expect(pkg.fastboot.appName).to.equal('basic-app');
    });

    it('contains the application config', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      let config = pkg.fastboot.config["basic-app"];

      expect(config.APP.version).to.include("0.0.0");

      delete config.APP.version;
      expect(config).to.deep.equal({
        modulePrefix: "basic-app",
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
          name: "basic-app",
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

    it('contains additional config from ember-fastboot-build-example addon', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      expect(pkg.fastboot.config['foo']).to.equal('bar');
    });

    // describe('with addon that implements fastbootConfigTree', function () {
    //   let app;

    //   before(function () {
    //     app = new AddonTestApp();

    //     return app.create('fastboot-config', {
    //       skipNpm: true
    //     })
    //       .then(addFastBootDeps)
    //       .then(function () {
    //         return app.run('npm', 'install');
    //       })
    //       .then(function () {
    //         return app.runEmberCommand('build');
    //       });
    //   });

    //   it('it extends the application config', function () {
    //     let pkg = fs.readJsonSync(app.filePath('dist/package.json'));

    //     expect(pkg.fastboot.config['fastboot-config']).to.deep.equal({
    //       foo: 'bar',
    //       modulePrefix: 'fastboot-config',
    //       environment: 'development',
    //       baseURL: '/',
    //       locationType: 'auto',
    //       EmberENV: { FEATURES: {} },
    //       APP: { name: 'fastboot-config', version: '0.0.0', autoboot: false },
    //       fastboot: { hostWhitelist: ['example.com', 'subdomain.example.com', '/localhost:\\d+/'] },
    //       exportApplicationGlobal: true
    //     });
    //   });
    // });
  });

  describe('with production FastBoot builds', function () {
    before(async function () {
      await execa("yarn", ["build:prod"]);
    });

    it('contains a manifest of FastBoot assets', function () {
      let pkg = fs.readJSONSync("dist/package.json");

      let manifest = pkg.fastboot.manifest;

      manifest.appFiles.forEach(file => {
        expect(`dist/${file}`).to.be.a.file();
      });

      expect(`dist/${manifest.htmlFile}`).to.be.a.file();

      manifest.vendorFiles.forEach(file =>  {
        expect(`dist/${file}`).to.be.a.file();
      });
    });
  });

  // describe('with customized fingerprinting options', function () {
  //   // Tests an app with a custom `assetMapPath` set
  //   let customApp = new AddonTestApp();

  //   before(function () {
  //     return customApp.create('customized-fingerprinting')
  //       .then(function () {
  //         return customApp.runEmberCommand('build', '--environment=production');
  //       });
  //   });

  //   it('respects a custom asset map path and prepended URLs', function () {
  //     expect(customApp.filePath('dist/totally-customized-asset-map.json')).to.be.a.file();

  //     function p(filePath) {
  //       return customApp.filePath(path.join('dist', filePath));
  //     }

  //     let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
  //     let manifest = pkg.fastboot.manifest;

  //     manifest.appFiles.forEach(function (file) {
  //       expect(p(file)).to.be.a.file();
  //     });
  //     expect(p(manifest.htmlFile)).to.be.a.file();
  //     manifest.vendorFiles.forEach(function (file) {
  //       expect(p(file)).to.be.a.file();
  //     });
  //   });

  //   it('respects individual files being excluded from fingerprinting', function () {
  //     expect(customApp.filePath('dist/totally-customized-asset-map.json')).to.be.a.file();

  //     let pkg = fs.readJsonSync(customApp.filePath('/dist/package.json'));
  //     let manifest = pkg.fastboot.manifest;

  //     // customized-fingerprinting-fastboot.js is excluded from fingerprinting
  //     expect(manifest.appFiles).to.include('assets/customized-fingerprinting-fastboot.js');
  //     // vendor.js is excluded from fingerprinting
  //     expect(manifest.vendorFiles).to.include('assets/vendor.js');
  //   });
  // });

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
