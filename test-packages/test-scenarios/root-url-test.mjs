import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import emberServe from './helpers/ember-serve.mjs';
import fetch from 'node-fetch';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('root-url', (project) => {
    merge(project.files, {
      app: {
        templates: {
          'application.hbs': `<h2 id="title">Welcome to Ember.js</h2>`,
        },
      },
      config: {
        'environment.js': `'use strict';

      module.exports = function(environment) {
        var ENV = {
          rootURL: '/my-root/',
          environment: environment,
          modulePrefix: 'classic-app-template',
          locationType: 'auto'
        };

        return ENV;
      };
      `,
      },
    });

    project.pkg.fastbootDependencies = ['crypto'];
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

      test('/ HTML contents', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/my-root/`, {
          headers: {
            Accept: 'text/html',
          },
        });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Welcome to Ember.js'));
      });

      test('Out of scope requests', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/foo-bar/`, {
          headers: {
            Accept: 'text/html',
          },
        });
        assert.equal(response.status, 404);
      });

      test('with fastboot query parameter turned on', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/my-root/?fastboot=true`, {
          headers: {
            Accept: 'text/html',
          },
        });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Welcome to Ember.js'));
      });

      test('with fastboot query parameter turned off', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/my-root/?fastboot=false`, {
          headers: {
            Accept: 'text/html',
          },
        });
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('<!-- EMBER_CLI_FASTBOOT_BODY -->'));
      });
    });
  });
