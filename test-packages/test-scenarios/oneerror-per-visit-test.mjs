import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import buildFastboot from './helpers/build-fastboot.mjs';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('oneerror-per-visit', (project) => {
    merge(project.files, {
      app: {
        'router.js': `import EmberRouter from '@ember/routing/router';
        import config from 'classic-app-template/config/environment';

        export default class Router extends EmberRouter {
          location = config.locationType;
          rootURL = config.rootURL;
        }

        Router.map(function () {
          this.route('slow', {
            path: '/slow/:timeout/:type',
          });
        });`,
        'instance-initializers': {
          'setup-onerror.js': `import Ember from 'ember';
          export function initialize(owner) {
            let isFastBoot = typeof 'FastBoot' !== 'undefined';
            let fastbootRequestPath;

            if (isFastBoot) {
              let fastbootService = owner.lookup('service:fastboot');
              fastbootRequestPath = fastbootService.request.path;
            } // normally only done in prod builds, but this makes the demo easier

            console.log('setting up error handler ' + fastbootRequestPath);

            Ember.onerror = function (error) {
              if (isFastBoot) {
                error.fastbootRequestPath = fastbootRequestPath;
                throw error;
              }
            };
          }

          export default {
            initialize,
          };
          `,
        },
        routes: {
          'application.js': `import Route from '@ember/routing/route';
          import { action } from '@ember/object';
          import Ember from 'ember';

          export default class ApplicationRoute extends Route {
            @action
            error(err) {
              Ember.onerror(err);
            }
          }
          `,
          'slow.js': `import Route from '@ember/routing/route';

          export default class SlowRoute extends Route {
            model({ timeout, type }) {
              return new Promise((resolve, reject) => {
                setTimeout(() => {
                  if (type === 'reject') {
                    let error = new Error('slow route rejected after '.concat(timeout));
                    error.code = 'from-slow';
                    reject(error);
                  } else {
                    resolve('slow route rejected after '.concat(timeout));
                  }
                }, timeout);
              });
            }
          }`,
        },
      },
    });
  })
  .forEachScenario((scenario) => {
    Qmodule(scenario.name, function (hooks) {
      let app; // PreparedApp

      hooks.before(async () => {
        app = await scenario.prepare();
      });

      test('errors can be properly attributed with buildSandboxPerVisit=true', async function (assert) {
        let fastboot = await buildFastboot(app);

        let first = fastboot.visit('/slow/100/reject', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/100/reject', headers: {} },
        });

        let second = fastboot.visit('/slow/50/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/50/resolve', headers: {} },
        });

        let third = fastboot.visit('/slow/25/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/25/resolve', headers: {} },
        });

        await Promise.all([second, third]);

        await first.then(
          () => {
            throw new Error('Visit should not resolve!');
          },
          (error) => {
            assert.equal(error.code, 'from-slow');
            assert.equal(
              error.fastbootRequestPath,
              '/slow/100/reject',
              'fastbootRequestPath does not match'
            );
          }
        );
      });

      test('it eagerly builds sandbox when queue is empty', async function (assert) {
        let fastboot = await buildFastboot(app, {
          maxSandboxQueueSize: 2,
        });

        let first = fastboot.visit('/slow/50/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/50/resolve', headers: {} },
        });

        let second = fastboot.visit('/slow/50/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/50/resolve', headers: {} },
        });

        let third = fastboot.visit('/slow/25/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/25/resolve', headers: {} },
        });

        let result = await first;
        let analytics = result.analytics;
        assert.deepEqual(analytics, {
          usedPrebuiltSandbox: true,
        });

        result = await second;
        analytics = result.analytics;
        assert.deepEqual(analytics, {
          usedPrebuiltSandbox: true,
        });

        result = await third;
        analytics = result.analytics;
        assert.deepEqual(analytics, {
          usedPrebuiltSandbox: false,
        });
      });

      test('it leverages sandbox from queue when present', async function (assert) {
        let fastboot = await buildFastboot(app, {
          maxSandboxQueueSize: 3,
        });

        let first = fastboot.visit('/slow/50/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/50/resolve', headers: {} },
        });

        let second = fastboot.visit('/slow/50/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/50/resolve', headers: {} },
        });

        let third = fastboot.visit('/slow/25/resolve', {
          buildSandboxPerVisit: true,
          request: { url: '/slow/25/resolve', headers: {} },
        });

        let result = await first;
        let analytics = result.analytics;
        assert.deepEqual(analytics, {
          usedPrebuiltSandbox: true,
        });

        result = await second;
        analytics = result.analytics;
        assert.deepEqual(analytics, {
          usedPrebuiltSandbox: true,
        });

        result = await third;
        analytics = result.analytics;
        assert.deepEqual(analytics, {
          usedPrebuiltSandbox: true,
        });
      });
    });
  });
