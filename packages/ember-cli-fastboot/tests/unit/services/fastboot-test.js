/* eslint-disable prettier/prettier */
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | fastboot in the browser', function(hooks) {
  setupTest(hooks);

  test('isFastBoot', function(assert) {
    let service = this.owner.lookup('service:fastboot');
    assert.false(service.isFastBoot, `it should be false`);
    assert.false(service.get('isFastBoot'), `it should be false`);
  });

  test('isFastboot', function(assert) {
    let service = this.owner.lookup('service:fastboot');
    assert.throws(() => service.isFastboot, `it should throw`);
    assert.throws(() => service.get('isFastboot'), `it should throw`);
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
