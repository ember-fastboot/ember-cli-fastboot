// can render the escaped shoebox HTML

import { baseApp } from './scenarios.mjs';
import { Scenarios } from 'scenario-tester';
import qunit from 'qunit';

const { module: Qmodule, test } = qunit;

Scenarios.fromProject(baseApp)
  .map('fastboot-shoebox-test', project => {
    // TODO add some specifics here
  })
  .forEachScenario(scenario => {
    Qmodule(scenario.name, function (hooks) {
      let app; // PreparedApp

      hooks.before(async () => {
        app = await scenario.prepare();
        // any custom setup that you have for each scenario  
      });

      test('it works', async function (assert) {
        // your custom test code
        assert.ok(true);
      });
    });
  });