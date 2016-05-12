import { moduleFor, test } from 'ember-qunit';

moduleFor('location:none', 'Unit | Location | none in the browser', {
  // Specify the other units that are required for this test.
  needs: ['service:fastboot']
});

test('setURL ', function (assert) {
  let location = this.subject();
  location.setURL('foo');
  assert.equal(location.get('path'), 'foo', 'it should execute and not call fastboot code');
});
