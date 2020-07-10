'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const execa = require("execa");

chai.use(require('chai-fs'));

describe('generating package.json', function () {
  this.timeout(50000);

  describe('with addon that implements fastbootConfigTree', function () {

    before(async function () {
      await execa("yarn", ["build"]);
    });

    it('it extends the application config', function () {
      let pkg = fs.readJSONSync('dist/package.json');

      let config = pkg.fastboot.config["custom-finger-print-app"];
      expect(config.APP.version).to.include("0.0.0");
      delete config.APP.version;

      expect(pkg.fastboot.config["custom-finger-print-app"]).to.deep.equal({
        foo: "bar",
        modulePrefix: "custom-finger-print-app",
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
          name: "custom-finger-print-app",
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
});
