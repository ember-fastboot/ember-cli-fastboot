import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import emberServe from './helpers/ember-serve.mjs';
import fetch from 'node-fetch';
import loadFromFixtureData from './helpers/load-from-fixture-data.mjs';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('fastboot-location', (project) => {
    merge(project.files, loadFromFixtureData('fastboot-location'));

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

      test('should NOT redirect when no transition is called', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/my-root/test-passed`, {
          redirect: 'manual',
          headers: {
            Accept: 'text/html',
          },
        });

        if (response.status === 500) throw new Error(await response.text());
        assert.equal(response.status, 200);

        assert.notOk(response.headers.has('location'));
        assert.ok(response.headers.has('x-fastboot-path'));
        assert.equal(response.headers.get('x-fastboot-path'), '/my-root/test-passed');

        const bodyText = await response.text();

        assert.ok(await bodyText.includes('The Test Passed!'));
      });

      test('should NOT redirect when intermediateTransitionTo is called', async function (assert) {
        const response = await fetch(
          `http://localhost:${process.port}/my-root/redirect-on-intermediate-transition-to`,
          {
            redirect: 'manual',
            headers: {
              Accept: 'text/html',
            },
          }
        );
        if (response.status === 500) throw new Error(await response.text());
        assert.equal(response.status, 200);

        assert.notOk(response.headers.has('location'));
        assert.ok(response.headers.has('x-fastboot-path'));
        assert.equal(
          response.headers.get('x-fastboot-path'),
          '/my-root/redirect-on-intermediate-transition-to'
        );

        const bodyText = await response.text();

        assert.notOk(bodyText.includes('Welcome to Ember'));
        assert.notOk(bodyText.includes('The Test Passed!'));
      });

      test('should redirect when transitionTo is called', async function (assert) {
        const response = await fetch(
          `http://localhost:${process.port}/my-root/redirect-on-transition-to`,
          {
            redirect: 'manual',
            headers: {
              Accept: 'text/html',
            },
          }
        );
        if (response.status === 500) throw new Error(await response.text());
        assert.equal(response.status, 307);

        assert.ok(response.headers.has('location'));
        assert.ok(response.headers.has('x-fastboot-path'));
        assert.equal(
          response.headers.get('location'),
          `http://localhost:${process.port}/my-root/test-passed`
        );
        assert.equal(response.headers.get(['x-fastboot-path']), '/my-root/test-passed');

        const body = await response.text();
        assert.ok(body.includes('Redirecting to'));
        assert.ok(body.includes('/my-root/test-passed'));
      });

      test('should redirect when replaceWith is called', async function (assert) {
        const response = await fetch(
          `http://localhost:${process.port}/my-root/redirect-on-replace-with`,
          {
            redirect: 'manual',
            headers: {
              Accept: 'text/html',
            },
          }
        );
        if (response.status === 500) throw new Error(await response.text());
        assert.equal(response.status, 307);

        assert.ok(response.headers.has('location'));
        assert.ok(response.headers.has('x-fastboot-path'));
        assert.equal(
          response.headers.get('location'),
          `http://localhost:${process.port}/my-root/test-passed`
        );
        assert.equal(response.headers.get(['x-fastboot-path']), '/my-root/test-passed');

        const body = await response.text();

        assert.ok(body.includes('Redirecting to'));
        assert.ok(body.includes('/my-root/test-passed'));
      });

      test('should NOT redirect when transitionTo is called with identical route name', async function (assert) {
        const response = await fetch(
          `http://localhost:${process.port}/my-root/noop-transition-to`,
          {
            redirect: 'manual',
            headers: {
              Accept: 'text/html',
            },
          }
        );
        if (response.status === 500) throw new Error(await response.text());
        assert.equal(response.status, 200);

        assert.notOk(response.headers.has('location'));
        assert.ok(response.headers.has('x-fastboot-path'));
        assert.equal(response.headers.get(['x-fastboot-path']), '/my-root/noop-transition-to');

        const body = await response.text();

        assert.ok(body.includes('Redirect to self'));
      });

      test('should NOT redirect when replaceWith is called with identical route name', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/my-root/noop-replace-with`, {
          redirect: 'manual',
          headers: {
            Accept: 'text/html',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        assert.equal(response.status, 200);

        assert.notOk(response.headers.has('location'));
        assert.ok(response.headers.has('x-fastboot-path'));
        assert.equal(response.headers.get(['x-fastboot-path']), '/my-root/noop-replace-with');

        const body = await response.text();

        assert.ok(body.includes('Redirect to self'));
      });
    });
  });
