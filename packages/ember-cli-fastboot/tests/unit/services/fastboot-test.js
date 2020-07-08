import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | fastboot in the browser', function(hooks) {
  setupTest(hooks);

  test('isFastBoot', function(assert) {
    let service = this.owner.lookup('service:fastboot');
    assert.equal(service.isFastBoot, false, `it should be false`);
    assert.equal(service.get('isFastBoot'), false, `it should be false`);
  });

  test('request', function(assert) {
    let service = this.owner.lookup('service:fastboot');
    assert.equal(service.get('request'), null, `it should be null`);
  });

  test('response', function(assert) {
    let service = this.owner.lookup('service:fastboot');
    assert.equal(service.get('response'), null, `it should be null`);
  });

  test('metadata', function(assert) {
    let service = this.owner.lookup('service:fastboot');
    assert.equal(service.get('metadata'), null, `it should be null`);
  });
});