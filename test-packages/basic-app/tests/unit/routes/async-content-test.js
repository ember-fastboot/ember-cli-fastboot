import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | async-content', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:async-content');
    assert.ok(route);
  });
});
