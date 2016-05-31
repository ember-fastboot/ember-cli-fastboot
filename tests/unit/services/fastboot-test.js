import { moduleFor, test } from 'ember-qunit';

moduleFor('service:fastboot', 'Unit | Service | fastboot in the browser', {});

test('isFastBoot', function(assert) {
  let service = this.subject();
  assert.equal(service.get('isFastBoot'), false, `it should be false`);
});

test('request', function(assert) {
  let service = this.subject();
  assert.equal(service.get('request'), null, `it should be null`);
});

test('response', function(assert) {
  let service = this.subject();
  assert.equal(service.get('response'), null, `it should be null`);
});
