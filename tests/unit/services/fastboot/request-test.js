import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | fastboot | request', function(hooks) {
  setupTest(hooks);

  test('retrieve returns request object if isFastBoot true and request property is set in _fastbootInfo', function(assert) {
    let service = this.owner.factoryFor('service:fastboot').create({
      isFastBoot: true,
      _fastbootInfo: {
        request: {
          method: 'GET',
          body: 'test body',
          headers: {
            header1: 'Test header'
          },
          queryParams: {
            qp1: 'qp1'
          },
          path: '/testPath',
          protocol: 'https',
          host: () => 'TestHost'
        }
      }
    });

    assert.strictEqual(service.get('request.method'), 'GET');
    assert.strictEqual(service.get('request.body'), 'test body');
    assert.strictEqual(service.get('request.headers.header1'), 'Test header');
    assert.strictEqual(service.get('request.queryParams.qp1'), 'qp1');
    assert.strictEqual(service.get('request.path'), '/testPath');
    assert.strictEqual(service.get('request.protocol'), 'https');
    assert.strictEqual(service.get('request.host'), 'TestHost');
  });
});