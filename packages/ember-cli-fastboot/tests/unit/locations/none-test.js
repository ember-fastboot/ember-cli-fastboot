import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Location | none in the browser', function (hooks) {
  setupTest(hooks);

  test('setURL ', function (assert) {
    let location = this.owner.lookup('location:none');
    location.setURL('foo');
    assert.equal(
      location.get('path'),
      'foo',
      'it should execute and not call fastboot code'
    );
  });
});
