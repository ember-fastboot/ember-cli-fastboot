import qunit from 'qunit';

import { appScenarios } from './scenarios.mjs';
import path from 'node:path';
import fs from 'fs-extra';

const { module: Qmodule, test } = qunit;

import './helpers/qunit-assertions.mjs';

appScenarios
  .map('custom-output-paths', (project) => {
    project.mergeFiles({
      'ember-cli-build.js': `var EmberApp = require('ember-cli/lib/broccoli/ember-app');

      module.exports = function(defaults) {
        var app = new EmberApp(defaults, {
          // it seems like something changed in ember-auto-import to break the inserter
          // when customising output paths
          autoImport: {
            insertScriptsAt: 'auto-import-script',
          },
          outputPaths: {
            app: {
              html: 'index.html',
              css: {
                'app': '/some-assets/path/app.css',
              },
              js: '/some-assets/path/app-file.js'
            },
            vendor: {
              js: '/some-assets/path/lib.js'
            }
          }
        });

        return app.toTree();
      };`,
      app: {
        'index.html': `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{content-for "head"}}

    <link integrity="" rel="stylesheet" href="{{rootURL}}assets/vendor.css">
    <link integrity="" rel="stylesheet" href="{{rootURL}}assets/classic-app-template.css">

    {{content-for "head-footer"}}
  </head>
  <body>
    {{content-for "body"}}

    <script src="{{rootURL}}assets/vendor.js"></script>
    <auto-import-script entrypoint="app"></auto-import-script>
    <script src="{{rootURL}}assets/classic-app-template.js"></script>

    {{content-for "body-footer"}}
  </body>
</html>
`,
      },
      tests: {
        'index.html': `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{content-for "head"}}
    {{content-for "test-head"}}

    <link rel="stylesheet" href="{{rootURL}}assets/vendor.css">
    <link rel="stylesheet" href="{{rootURL}}assets/classic-app-template.css">
    <link rel="stylesheet" href="{{rootURL}}assets/test-support.css">

    {{content-for "head-footer"}}
    {{content-for "test-head-footer"}}
  </head>
  <body>
    {{content-for "body"}}
    {{content-for "test-body"}}

    <div id="qunit"></div>
    <div id="qunit-fixture">
      <div id="ember-testing-container">
        <div id="ember-testing"></div>
      </div>
    </div>

    <script src="/testem.js" integrity="" data-embroider-ignore></script>
    <script src="{{rootURL}}assets/vendor.js"></script>
    <auto-import-script entrypoint="app"></auto-import-script>
    <script src="{{rootURL}}assets/test-support.js"></script>
    <auto-import-script entrypoint="tests"></auto-import-script>
    <script src="{{rootURL}}assets/classic-app-template.js"></script>
    <script src="{{rootURL}}assets/tests.js"></script>

    {{content-for "body-footer"}}
    {{content-for "test-body-footer"}}
  </body>
</html>
`,
      },
    });

    project.removeDependency('ember-fetch');
  })
  .forEachScenario((scenario) => {
    Qmodule(scenario.name, function (hooks) {
      let app; // PreparedApp

      hooks.before(async () => {
        app = await scenario.prepare();
        const result = await app.execute(`pnpm ember build`);
        if (result.exitCode !== 0) {
          throw new Error(result.stderr);
        }
      });

      test('respects custom output paths and maps to them in the manifest', function (assert) {
        let pkg = fs.readJsonSync(path.join(app.dir, 'dist/package.json'));
        let manifest = pkg.fastboot.manifest;

        assert.ok(manifest.appFiles.includes('some-assets/path/app-file.js'));
        manifest.appFiles.forEach((file) => {
          assert.distFile(app, file);
        });
        assert.distFile(app, manifest.htmlFile);

        assert.ok(manifest.vendorFiles.includes('some-assets/path/lib.js'));
        manifest.vendorFiles.forEach((file) => {
          assert.distFile(app, file);
        });
      });
    });
  });
