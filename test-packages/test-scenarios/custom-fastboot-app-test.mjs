import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import path from 'node:path';
import fs from 'fs-extra';

qunit.assert.includes = function (haystack, needle) {
  if (!Array.isArray(haystack)) {
    this.pushResult({
      result: false,
      message: 'you must pass an array to assert.includes',
    });
    return;
  }

  this.pushResult({
    result: haystack.includes(needle),
    expected: needle,
    actual: haystack,
    message: `[${needle}] is missing from the array`,
  });
};

const { module: Qmodule, test } = qunit;

appScenarios
  .map('custom-fastboot-app', (project) => {
    merge(project.files, {
      'ember-cli-build.js': `'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      prepend: 'https://totally-sick-cdn.example.com/',
      exclude: ['vendor.js', 'classic-app-template.js'],
      generateAssetMap: true,
      assetMapPath: 'totally-customized-asset-map.json'
    }
  });

  return app.toTree();
};
`,
      public: {
        'custom-index.html': `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>custom index</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- EMBER_CLI_FASTBOOT_HEAD -->

    <link rel="stylesheet" href="assets/vendor.css">
    <link rel="stylesheet" href="assets/custom-html-file.css">
  </head>
  <body>
    <!-- EMBER_CLI_FASTBOOT_BODY -->

    <script src="assets/vendor.js"></script>
    <script src="assets/custom-html-file.js"></script>
  </body>
</html>
`,
      },
      config: {
        'environment.js': `'use strict';

module.exports = function(environment) {
  let ENV = {
    modulePrefix: 'custom-fastboot-app',
    environment,
    rootURL: '/',
    locationType: 'auto',

    fastboot: {
      htmlFile: 'custom-index.html'
    },

    EmberENV: {
      FEATURES: {},
      EXTEND_PROTOTYPES: {
        Date: false
      }
    },

    APP: {}
  };

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
    ENV.APP.autoboot = false;
  }

  return ENV;
};
`,
      },
    });

    project.removeDependency('ember-fetch');
  })
  .forEachScenario((scenario) => {
    Qmodule(scenario.name, function (hooks) {
      let app; // PreparedApp

      qunit.assert.file = function (filePath) {
        this.pushResult({
          result: fs.existsSync(path.join(app.dir, 'dist', filePath)),
          expected: filePath,
          actual: fs.readdirSync(path.join(app.dir, 'dist')),
          message: 'File does not exist',
        });
      };

      hooks.before(async () => {
        app = await scenario.prepare();
        const result = await app.execute(`pnpm build`);
        if (result.exitCode !== 0) {
          throw new Error(result.stderr);
        }
      });

      test('builds a package.json', function (assert) {
        assert.file('totally-customized-asset-map.json');
        assert.file('package.json');
      });

      test('respects a custom asset map path and prepended URLs', function (assert) {
        assert.file('totally-customized-asset-map.json');
        let pkg = fs.readJSONSync(path.join(app.dir, 'dist/package.json'));
        let manifest = pkg.fastboot.manifest;

        manifest.appFiles.forEach((file) => {
          assert.file(file);
        });

        assert.file(manifest.htmlFile);

        manifest.vendorFiles.forEach((file) => {
          assert.file(file);
        });
      });

      test('respects individual files being excluded from fingerprinting', function (assert) {
        assert.file('totally-customized-asset-map.json');

        let pkg = fs.readJSONSync(path.join(app.dir, 'dist/package.json'));
        let manifest = pkg.fastboot.manifest;

        // classic-app-template is excluded from fingerprinting
        assert.includes(manifest.appFiles, 'assets/classic-app-template.js');
        // vendor.js is excluded from fingerprinting
        assert.includes(manifest.vendorFiles, 'assets/vendor.js');
      });

      test('with custom htmlFile it uses custom htmlFile in the manifest', function (assert) {
        let pkg = fs.readJSONSync(path.join(app.dir, 'dist/package.json'));
        let manifest = pkg.fastboot.manifest;

        assert.equal(manifest.htmlFile, 'custom-index.html');
        assert.file(manifest.htmlFile);
      });
    });
  });
