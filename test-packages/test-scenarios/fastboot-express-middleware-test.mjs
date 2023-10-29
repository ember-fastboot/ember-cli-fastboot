import qunit from 'qunit';
import lodash from 'lodash';
import { join } from 'path';

import { appScenarios } from './scenarios.mjs';
import fastbootMiddleware from 'fastboot-express-middleware';
import TestHTTPServer from './helpers/test-http-server.mjs';

const { merge } = lodash;
const { module: Qmodule, test } = qunit;

qunit.extend(qunit.assert, {
  matches: function (actual, regex, message) {
    var success = !!regex && !!actual && new RegExp(regex).test(actual);
    var expected = 'String matching /' + regex.toString() + '/';
    this.push(success, actual, expected, message);
  },
});

appScenarios
  .map('fastboot-express-middleware', (project) => {
    merge(project.files, {
      app: {
        routes: {
          'index.js': `import Route from '@ember/routing/route';
          import { inject as service } from '@ember/service';

          function isEmptyObject(obj) {
            return Object.keys(obj).length === 0 && obj.constructor.name === 'Object';
          }

          export default class IndexRoute extends Route {
            @service fastboot;

            model() {
              // this.fastboot.metadata defaults to an empty object so we need to check for that case here
              if (this.fastboot && this.fastboot.metadata && !isEmptyObject(this.fastboot.metadata)) {
                return this.fastboot.metadata;
              }

              return "Hello Ember!";
            }
          }`,
          'application.js': `import Route from '@ember/routing/route';
          import { inject as service } from '@ember/service';

          export default class ApplicationRoute extends Route {
            @service fastboot;
            afterModel() {
              if (this.fastboot.isFastBoot) {
                this.fastboot.response.headers.append('X-FastBoot', 'a');
                this.fastboot.response.headers.append('X-FastBoot', 'b');
                this.fastboot.response.headers.append('X-FastBoot', 'c');
              }
            }
          }
          `,
        },
        templates: {
          'index.hbs': '{{@model}}',
        },
      },
    });
  })
  .forEachScenario((scenario) => {
    Qmodule(scenario.name, function (hooks) {
      let app; // PreparedApp
      let server;

      hooks.before(async () => {
        app = await scenario.prepare();
        await app.execute(`node node_modules/ember-cli/bin/ember build`);
      });

      hooks.afterEach(async () => {
        await server.stop();
      });

      test('it appends multivalue headers', async function (assert) {
        server = new TestHTTPServer(fastbootMiddleware(join(app.dir, 'dist')));
        await server.start();

        let { headers } = await server.request('/', { resolveWithFullResponse: true });
        assert.deepEqual(headers['x-fastboot'], 'a, b, c');
      });

      test('can pass metadata info to the app', async function (assert) {
        server = new TestHTTPServer(
          fastbootMiddleware({
            distPath: join(app.dir, 'dist'),
            visitOptions: {
              metadata: 'Fastboot Metadata',
            },
          })
        );
        await server.start();

        let html = await server.request('/');
        assert.matches(html, /Fastboot Metadata/);
      });

      test('works without metadata passed', async function (assert) {
        server = new TestHTTPServer(
          fastbootMiddleware({
            distPath: join(app.dir, 'dist'),
          })
        );
        await server.start();

        let html = await server.request('/');
        assert.matches(html, /Hello Ember!/);
      });
    });
  });
