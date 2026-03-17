import qunit from 'qunit';
import { merge } from 'lodash-es';
import { execaNode } from 'execa';
import { join } from 'path';

import { appScenarios, baseApp } from './scenarios.mjs';
import buildFastboot from './helpers/build-fastboot.mjs';
import loadFromFixtureData from './helpers/load-from-fixture-data.mjs';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('integration-tests', (project) => {
    merge(project.files, loadFromFixtureData('basic-app'));
    project.linkDependency('fake-addon', { baseDir: './' });
    project.linkDependency('fake-addon-2', { baseDir: './' });
    project.linkDependency('ember-cli-head', { baseDir: './' });
  })
  .forEachScenario((scenario) => {
    Qmodule(scenario.name, function (hooks) {
      let app; // PreparedApp
      let fastboot;

      hooks.before(async () => {
        app = await scenario.prepare();
        fastboot = await buildFastboot(app);
      });

      test('can render HTML', async function (assert) {
        const html = await fastboot.visit('/').then((r) => r.html());

        assert.matches(html, /Basic fastboot ember app/);
      });

      test('can run multiple visits', async function (assert) {
        let html = await fastboot.visit('/').then((r) => r.html());
        assert.matches(html, /Basic fastboot ember app/);

        html = await fastboot.visit('/').then((r) => r.html());
        assert.matches(html, /Basic fastboot ember app/);

        html = await fastboot.visit('/').then((r) => r.html());
        assert.matches(html, /Basic fastboot ember app/);
      });

      test('cannot not render app HTML with shouldRender set as false', async function (assert) {
        return fastboot
          .visit('/', {
            shouldRender: false,
          })
          .then((r) => r.html())
          .then((html) => {
            assert.notMatches(html, /Basic fastboot ember app/);
          });
      });

      test('can serialize the head and body', async function (assert) {
        return fastboot.visit('/').then((r) => {
          let contents = r.domContents();

          assert.equal(
            contents.head.trim(),
            `<meta name="ember-cli-head-start" content><meta property="og:title">\n<meta name="ember-cli-head-end" content>`
          );
          assert.matches(contents.body, /Basic fastboot ember app/);
        });
      });

      // TODO figure out why this is failing
      test.skip('can forcefully destroy the app instance using destroyAppInstanceInMs', async function (assert) {
        return fastboot
          .visit('/', {
            destroyAppInstanceInMs: '5',
          })
          .then(() => {
            throw new Error('request should not have succeeded');
          })
          .catch((e) => {
            assert.equal(e.message, 'App instance was forcefully destroyed in 5ms');
          });
      });

      // TODO move this to its own module because we do multiple builds here where we don't need to
      test('can reload the distPath', async function (assert) {
        const fastboot = await buildFastboot(app);
        let otherAppProject = baseApp();
        merge(otherAppProject.files, {
          app: {
            templates: {
              'application.hbs': `<h2 id="title">Hot swap ember app</h2>`,
            },
          },
        });
        await otherAppProject.write();
        await execaNode(`node_modules/.bin/ember`, ['build'], {
          cwd: otherAppProject.baseDir,
        });

        let html = await fastboot.visit('/').then((r) => r.html());
        assert.matches(html, /Basic fastboot ember app/);

        fastboot.reload({
          distPath: join(otherAppProject.baseDir, 'dist'),
        });

        html = await fastboot.visit('/').then((r) => r.html());
        assert.matches(html, /Hot swap ember app/);
      });

      test('can reload the app using the same buildSandboxGlobals', async function (assert) {
        const fastboot = await buildFastboot(app, {
          buildSandboxGlobals(globals) {
            return Object.assign({}, globals, {
              foo: 5,
              myVar: 'undefined',
            });
          },
        });

        let otherAppProject = baseApp();
        merge(otherAppProject.files, {
          app: {
            routes: {
              'application.js': `import Route from "@ember/routing/route";

              export default class ApplicationRoute extends Route {
                model() {
                  if (typeof FastBoot !== "undefined") {
                    return foo;
                  }
                }
              }`,
            },
            templates: {
              'application.hbs': `<h2 id="title">Welcome to Ember</h2>

              <div>foo from sandbox: {{@model}}</div>

              {{outlet}}`,
            },
          },
        });
        await otherAppProject.write();
        await execaNode(`node_modules/.bin/ember`, ['build'], {
          cwd: otherAppProject.baseDir,
        });

        let html = await fastboot.visit('/').then((r) => r.html());

        assert.matches(html, /Basic fastboot ember app/);

        fastboot.reload({
          distPath: join(otherAppProject.baseDir, 'dist'),
        });

        html = await fastboot.visit('/').then((r) => r.html());
        assert.matches(html, /foo from sandbox: 5/);
      });

      test('does not break the render with empty metadata', async function (assert) {
        return fastboot
          .visit('/metadata')
          .then((r) => r.html())
          .then((html) => {
            assert.matches(html, /test fastboot metadata/);
          });
      });
    });
  });
