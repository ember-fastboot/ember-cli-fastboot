import { moduleFor, test } from 'ember-qunit';
import sinon from 'sinon';

let sandbox;

moduleFor('service:fastboot', 'Unit | Service | fastboot | shoebox', {
  beforeEach() {
    sandbox = sinon.sandbox.create();
  },
  afterEach() {
    sandbox.restore();
  }
});

test('retrieve returns value if isFastBoot false and key is cached', function(assert) {
  let service = this.subject();

  service.set('shoebox.foo', 'bar');

  assert.strictEqual(service.get('shoebox').retrieve('foo'), 'bar');
});

test('retrieve returns undefined if isFastBoot false and shoebox is missing', function(assert) {
  let service = this.subject();

  let stub = sandbox.stub(document, 'querySelector').withArgs('#shoebox-foo');

  assert.strictEqual(service.get('shoebox').retrieve('foo'), undefined);

  sinon.assert.calledOnce(stub);
});

test('retrieve returns undefined if isFastBoot false and textContent is missing', function(assert) {
  let service = this.subject();

  let stub = sandbox.stub(document, 'querySelector').withArgs('#shoebox-foo').returns({});

  assert.strictEqual(service.get('shoebox').retrieve('foo'), undefined);

  sinon.assert.calledOnce(stub);
});

test('retrieve returns value if isFastBoot false and textContent is present', function(assert) {
  let service = this.subject();

  let stub = sandbox.stub(document, 'querySelector').withArgs('#shoebox-foo').returns({
    textContent: '{"foo":"bar"}'
  });

  assert.deepEqual(service.get('shoebox').retrieve('foo'), {
    foo: 'bar'
  });

  sinon.assert.calledOnce(stub);
});

test('retrieve returns undefined if isFastBoot true and shoebox is missing', function(assert) {
  let service = this.subject({
    isFastBoot: true,
    _fastbootInfo: {}
  });

  assert.strictEqual(service.get('shoebox').retrieve('foo'), undefined);
});

test('retrieve returns undefined if isFastBoot true and key is missing', function(assert) {
  let service = this.subject({
    isFastBoot: true,
    _fastbootInfo: {
      shoebox: {}
    }
  });

  assert.strictEqual(service.get('shoebox').retrieve('foo'), undefined);
});

test('retrieve returns value if isFastBoot true and key is present', function(assert) {
  let service = this.subject({
    isFastBoot: true,
    _fastbootInfo: {
      shoebox: {
        foo: 'bar'
      }
    }
  });

  assert.strictEqual(service.get('shoebox').retrieve('foo'), 'bar');
});
