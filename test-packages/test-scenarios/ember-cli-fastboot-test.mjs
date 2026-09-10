import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import emberServe from './helpers/ember-serve.mjs';
import fetch from 'node-fetch';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('ember-cli-fastboot', (project) => {
    merge(project.files, {
      app: {
        routes: {
          'application.js': `import Route from '@ember/routing/route';

          export default class ApplicationRoute extends Route {
            model() {
              if (typeof FastBoot !== 'undefined') {
                return window.myGlobal;
              }
            }
          }`,
        },
        templates: {
          'application.hbs': '<h1>{{@model}}</h1>',
        },
      },
      config: {
        'fastboot.js': `module.exports = function(environment) {
          return {
            sandboxGlobals: {
              myGlobal: 'My Global'
            }
          };
        }`,
      },
    });
  })
  .forEachScenario((scenario) => {
    Qmodule(scenario.name, function (hooks) {
      ['default', 'rehydrate'].forEach((renderMode) => {
        let app; // PreparedApp
        let process;

        hooks.before(async () => {
          app = await scenario.prepare();
        });

        hooks.after(() => {
          return process.stop();
        });

        test(`provides sandbox globals with render mode ${renderMode}`, async function (assert) {
          process = await emberServe(
            app,
            renderMode === 'rehydrate'
              ? {
                  EXPERIMENTAL_RENDER_MODE_SERIALIZE: 'true',
                }
              : {}
          );

          const response = await fetch(`http://localhost:${process.port}/`, {
            headers: {
              Accept: 'text/html',
            },
          });

          assert.equal(response.status, 200, 'Status should be ok');
          assert.equal(
            response.headers.get('content-type'),
            'text/html; charset=utf-8',
            'headers should be right'
          );

          const body = await response.text();
          if (renderMode === 'rehydrate') {
            assert.matches(body, /-->My Global<!--/);
          } else {
            assert.matches(body, /<h1>My Global<\/h1>/);
          }
        });
      });
    });
  });
