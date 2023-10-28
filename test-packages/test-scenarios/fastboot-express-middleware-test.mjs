import qunit from 'qunit';
import lodash from 'lodash';
import { join } from 'path';

import { appScenarios } from './scenarios.mjs';
import fastbootMiddleware from 'fastboot-express-middleware';
import TestHTTPServer from './helpers/test-http-server.mjs';

const { merge } = lodash;
const { module: Qmodule, test } = qunit;

appScenarios
  .map('fastboot-express-middleware', (project) => {
    merge(project.files, {
      app: {
        routes: {
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
        let middleware = fastbootMiddleware(join(app.dir, 'dist'));
        server = new TestHTTPServer(middleware);
        await server.start();
      });

      hooks.after(async () => {
        server.stop();
      });

      test('it appends multivalue headers', async function (assert) {
        let { headers } = await server.request('/', { resolveWithFullResponse: true });
        assert.deepEqual(headers['x-fastboot'], 'a, b, c');
      });
    });
  });
