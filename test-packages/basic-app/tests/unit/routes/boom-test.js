import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | boom', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:boom');
    assert.ok(route);
  });
});
