import qunit from 'qunit';
import { merge } from 'lodash-es';
import { expect } from 'chai';

import { appScenarios } from './scenarios.mjs';
import buildFastboot from './helpers/build-fastboot.mjs';

const { module: Qmodule, test } = qunit;

appScenarios
  .map('fastboot-shoebox-test', (project) => {
    merge(project.files, {
      app: {
        routes: {
          'application.js': `import Route from '@ember/routing/route';
          import { inject as service } from '@ember/service'

          export default class ApplicationRoute extends Route {
            @service fastboot;

            model() {
              const fastboot = this.fastboot;
              var shoebox = fastboot.shoebox;
              if (fastboot.isFastBoot) {
                shoebox.put('key1', { foo: 'bar' });
                shoebox.put('key2', { zip: 'zap' });
                shoebox.put('key3', { htmlSpecialCase: 'R&B > Jazz' });
                shoebox.put('key4', { nastyScriptCase: "<script>alert('owned');</script></script></script>" });
                shoebox.put('key5', { otherUnicodeChars: '&&>><<\u2028\u2028\u2029\u2029' });
              }
            }
          }`,
        },
      },
    });
  })
  .forEachScenario((scenario) => {
    Qmodule(scenario.name, function (hooks) {
      let app; // PreparedApp
      let fastboot;

      hooks.before(async () => {
        app = await scenario.prepare();
        fastboot = await buildFastboot(app);
      });

      test('can render the escaped shoebox HTML', async function (assert) {
        // we ported the tests directly from mocha so we're re-using the expect style
        assert.expect(0);

        const html = await fastboot.visit('/').then((r) => r.html());

        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key1">{"foo":"bar"}<\/script>/
        );
        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key2">{"zip":"zap"}<\/script>/
        );

        // Special characters are JSON encoded, most notably the </script sequence.
        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key4">{"nastyScriptCase":"\\u003cscript\\u003ealert(\'owned\');\\u003c/script\\u003e\\u003c/script\\u003e\\u003c/script\\u003e"}</script>'
        );

        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key5">{"otherUnicodeChars":"\\u0026\\u0026\\u003e\\u003e\\u003c\\u003c\\u2028\\u2028\\u2029\\u2029"}</script>'
        );
      });

      test('can render the escaped shoebox HTML with shouldRender set to false', async function (assert) {
        // we ported the tests directly from mocha so we're re-using the expect style
        assert.expect(0);

        const html = await fastboot
          .visit('/', {
            shouldRender: false,
          })
          .then((r) => r.html());

        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key1">{"foo":"bar"}<\/script>/
        );
        expect(html).to.match(
          /<script type="fastboot\/shoebox" id="shoebox-key2">{"zip":"zap"}<\/script>/
        );

        // Special characters are JSON encoded, most notably the </script sequence.
        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key4">{"nastyScriptCase":"\\u003cscript\\u003ealert(\'owned\');\\u003c/script\\u003e\\u003c/script\\u003e\\u003c/script\\u003e"}</script>'
        );

        expect(html).to.include(
          '<script type="fastboot/shoebox" id="shoebox-key5">{"otherUnicodeChars":"\\u0026\\u0026\\u003e\\u003e\\u003c\\u003c\\u2028\\u2028\\u2029\\u2029"}</script>'
        );
      });

      test('cannot render the escaped shoebox HTML when disableShoebox is set to true', async function (assert) {
        // we ported the tests directly from mocha so we're re-using the expect style
        assert.expect(0);

        const html = await fastboot
          .visit('/', {
            disableShoebox: true,
          })
          .then((r) => r.html());

        expect(html).to.not.match(
          /<script type="fastboot\/shoebox" id="shoebox-key1">{"foo":"bar"}<\/script>/
        );
        expect(html).to.not.match(
          /<script type="fastboot\/shoebox" id="shoebox-key2">{"zip":"zap"}<\/script>/
        );

        // Special characters are JSON encoded, most notably the </script sequence.
        expect(html).to.not.include(
          '<script type="fastboot/shoebox" id="shoebox-key4">{"nastyScriptCase":"\\u003cscript\\u003ealert(\'owned\');\\u003c/script\\u003e\\u003c/script\\u003e\\u003c/script\\u003e"}</script>'
        );

        expect(html).to.not.include(
          '<script type="fastboot/shoebox" id="shoebox-key5">{"otherUnicodeChars":"\\u0026\\u0026\\u003e\\u003e\\u003c\\u003c\\u2028\\u2028\\u2029\\u2029"}</script>'
        );
      });
    });
  });
