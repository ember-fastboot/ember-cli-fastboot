import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import emberServe from './helpers/ember-serve.mjs';
import fetch from 'node-fetch';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('fastboot-config-location', (project) => {
    merge(project.files, {
      app: {
        routes: {
          'redirect-on-transition-to.js': `
          import Route from '@ember/routing/route';
          import { inject as service } from '@ember/service';

          export default class MyRoute extends Route {
            @service
            router;

            beforeModel() {
              this.router.transitionTo('test-passed');
            }
          }
          `,
          'test-passed.js': `
          import Ember from 'ember';

          export default Ember.Route.extend({});
          `,
        },
        templates: {
          'test-passed.hbs': `<h1>The Test Passed!</h1>

          <p>All redirection tests should be set up to redirect here.</p>`,
        },
        'router.js': `
        import Ember from 'ember';

        let Router = Ember.Router;

        Router.map(function() {
          this.route('redirect-on-transition-to');
          this.route('test-passed');
        });

        export default Router;
        `,
      },
      config: {
        'environment.js': `
        'use strict';

        module.exports = function(environment) {
          var ENV = {
            rootURL: '/',
            locationType: 'auto',
            environment: environment,
            modulePrefix: 'classic-app-template',
            fastboot: {
              fastbootHeaders: false,
              hostWhitelist: [/localhost:\\d+/],
              redirectCode: 302,
            }
          };

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
      let process;

      hooks.before(async () => {
        app = await scenario.prepare();
        process = await emberServe(app);
      });

      hooks.after(() => {
        return process.stop();
      });

      test('use the redirect code provided by the EmberApp', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/redirect-on-transition-to`, {
          headers: {
            Accept: 'text/html',
          },
          redirect: 'manual',
        });
        if (response.status === 500) throw new Error(await response.text());
        assert.equal(response.status, 302);
        assert.equal(
          response.headers.get('location'),
          `http://localhost:${process.port}/test-passed`
        );
      });

      Qmodule('when fastboot.fastbootHeaders is false', function () {
        test('should not send the "x-fastboot-path" header on a redirect', async function (assert) {
          const response = await fetch(
            `http://localhost:${process.port}/redirect-on-transition-to`,
            {
              redirect: 'manual',
              headers: {
                Accept: 'text/html',
              },
            }
          );
          if (response.status === 500) throw new Error(await response.text());
          assert.notOk(response.headers.has('x-fastboot-path'));
        });
      });
    });
  });
