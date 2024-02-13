import qunit from 'qunit';
import { merge } from 'lodash-es';

import { appScenarios } from './scenarios.mjs';
import emberServe from './helpers/ember-serve.mjs';
import fetch from 'node-fetch';
import loadFromFixtureData from './helpers/load-from-fixture-data.mjs';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('request-details', (project) => {
    merge(project.files, loadFromFixtureData('request-details'));

    project.pkg.fastbootDependencies = ['crypto'];
    project.pkg['ember-addon'] = {
      paths: ['lib/post-middleware'],
    };

    project.linkDevDependency('body-parser', { baseDir: '.' });
    project.linkDevDependency('fastboot-express-middleware', { baseDir: '.' });
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

      test('makes host available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/show-host`, {
          headers: {
            Accept: 'text/html',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes(`Host: localhost:${process.port}`));
        assert.ok(body.includes(`Host from Instance Initializer: localhost:${process.port}`));
      });

      test('makes protocol available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/show-protocol`, {
          headers: {
            Accept: 'text/html',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Protocol: http:'));
        assert.ok(body.includes('Protocol from Instance Initializer: http:'));
      });

      test('makes path available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/show-path`, {
          headers: {
            Accept: 'text/html',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Path: /show-path'));
        assert.ok(body.includes('Path from Instance Initializer: /show-path'));
      });

      test('makes query params available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/list-query-params?foo=bar`, {
          headers: {
            Accept: 'text/html',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Query Params: bar'));
        assert.ok(body.includes('Query Params from Instance Initializer: bar'));
      });

      test('makes cookies available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/list-cookies`, {
          headers: {
            Accept: 'text/html',
            Cookie: 'city=Cluj',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Cookies: Cluj'));
        assert.ok(body.includes('Cookies from Instance Initializer: Cluj'));
      });

      test('makes headers available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/list-headers`, {
          headers: {
            'X-FastBoot-info': 'foobar',
            Accept: 'text/html',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Headers: foobar'));
        assert.ok(body.includes('Headers from Instance Initializer: foobar'));
      });

      test('makes method available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/show-method`, {
          headers: {
            Accept: 'text/html',
          },
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Method: GET'));
        assert.ok(body.includes('Method from Instance Initializer: GET'));
      });

      test('makes body available via a service', async function (assert) {
        const response = await fetch(`http://localhost:${process.port}/show-body`, {
          method: 'POST',
          headers: {
            Accept: 'text/html',
            'Content-Type': 'text/plain',
          },
          body: 'TEST',
        });
        if (response.status === 500) throw new Error(await response.text());
        const body = await response.text();
        assert.ok(body.includes('Body: TEST'));
        assert.ok(body.includes('Body from Instance Initializer: TEST'));
      });
    });
  });
