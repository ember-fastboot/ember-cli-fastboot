/* global FastBoot */
import { getOwner } from '@ember/application';
import { computed, get, set } from '@ember/object';
import { assert } from '@ember/debug';
import EObject from '@ember/object';
import Service from '@ember/service';
import { cached } from '@glimmer/tracking';

const RequestObject = EObject.extend({
  init() {
    this._super(...arguments);

    let request = this.request;
    delete this.request;

    this.method = request.method;
    this.body = request.body;
    this.cookies = request.cookies;
    this.headers = request.headers;
    this.queryParams = request.queryParams;
    this.path = request.path;
    this.protocol = request.protocol;
    this._host = function() {
      return request.host();
    };
  },

  host: computed(function() {
    return this._host();
  })
});

const Shoebox = EObject.extend({
  put(key, value) {
    assert('shoebox.put is only invoked from the FastBoot rendered application', this.get('fastboot.isFastBoot'));
    assert('the provided key is a string', typeof key === 'string');

    let fastbootInfo = this.get('fastboot._fastbootInfo');
    if (!fastbootInfo.shoebox) { fastbootInfo.shoebox = {}; }

    fastbootInfo.shoebox[key] = value;
  },

  retrieve(key) {
    if (this.get('fastboot.isFastBoot')) {
      let shoebox = this.get('fastboot._fastbootInfo.shoebox');
      if (!shoebox) { return; }

      return shoebox[key];
    }

    let shoeboxItem = this.get(key);
    if (shoeboxItem) { return shoeboxItem; }

    let el = document.querySelector(`#shoebox-${key}`);
    if (!el) { return; }
    let valueString = el.textContent;
    if (!valueString) { return; }

    shoeboxItem = JSON.parse(valueString);
    this.set(key, shoeboxItem);

    return shoeboxItem;
  }
});

class FastBootService extends Service {
  isFastBoot = typeof FastBoot !== 'undefined';

  get isFastboot() {
    assert(
      'The fastboot service does not have an `isFastboot` property. This is likely a typo. Please use `isFastBoot` instead.',
      false
    );
  }

  init() {
    super.init(...arguments);

    let shoebox = Shoebox.create({ fastboot: this });
    set(this, 'shoebox', shoebox);
  }

  get response() {
    return this._fastbootInfo.response;
  }
  get metadata() {
    return this._fastbootInfo.metadata;
  }

  @cached
  get request() {
    if (!this.isFastBoot) return null;
    return RequestObject.create({ request: get(this, '_fastbootInfo.request') });
  }

  get _fastbootInfo() {
    // this getter is to avoid deprecation from [RFC - 680](https://github.com/emberjs/rfcs/pull/680)
    return getOwner(this).lookup('info:-fastboot');
  }

  // setter required to avoid deprecation
  set _fastbootInfo() {}

  deferRendering(promise) {
    assert('deferRendering requires a promise or thennable object', typeof promise.then === 'function');
    this._fastbootInfo.deferRendering(promise);
  }
}

export default FastBootService;
