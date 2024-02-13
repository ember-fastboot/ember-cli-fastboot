import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import path from 'node:path';
import fs from 'fs-extra';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('custom-output-paths', (project) => {
    merge(project.files, {
      'ember-cli-build.js': `var EmberApp = require('ember-cli/lib/broccoli/ember-app');

      module.exports = function(defaults) {
        var app = new EmberApp(defaults, {
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
        function assertFile(filePath) {
          assert.ok(fs.existsSync(path.join(app.dir, 'dist', filePath)));

          const stat = fs.statSync(path.join(app.dir, 'dist', filePath));
          assert.ok(stat.isFile);
        }

        let pkg = fs.readJsonSync(path.join(app.dir, 'dist/package.json'));
        let manifest = pkg.fastboot.manifest;

        assert.ok(manifest.appFiles.includes('some-assets/path/app-file.js'));
        manifest.appFiles.forEach(assertFile);
        assertFile(manifest.htmlFile);

        assert.ok(manifest.vendorFiles.includes('some-assets/path/lib.js'));
        manifest.vendorFiles.forEach(assertFile);
      });
    });
  });
