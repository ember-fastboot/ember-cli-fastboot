/* global FastBoot */
import { getOwner } from '@ember/application';
import { assert } from '@ember/debug';
import Service from '@ember/service';

class RequestObject {
  constructor(request) {
    this.method = request.method;
    this.body = request.body;
    this.cookies = request.cookies;
    this.headers = request.headers;
    this.queryParams = request.queryParams;
    this.path = request.path;
    this.protocol = request.protocol;
    this._host = function () {
      return request.host();
    };
  }

  get host() {
    return this._host;
  }
}

class Shoebox {
  /**
   *
   * @param {FastBootService} fastboot
   */
  constructor(fastboot) {
    this.fastboot = fastboot;
  }

  put(key, value) {
    assert(
      'shoebox.put is only invoked from the FastBoot rendered application',
      this.fastboot.isFastBoot
    );
    assert('the provided key is a string', typeof key === 'string');

    let fastbootInfo = this.fastboot._fastbootInfo;
    if (!fastbootInfo.shoebox) {
      fastbootInfo.shoebox = {};
    }

    fastbootInfo.shoebox[key] = value;
  }

  retrieve(key) {
    if (this.fastboot.isFastBoot) {
      let shoebox = this.fastboot._fastbootInfo.shoebox;
      if (!shoebox) {
        return;
      }

      return shoebox[key];
    }

    let shoeboxItem = this[key];
    if (shoeboxItem) {
      return shoeboxItem;
    }

    let el = document.querySelector(`#shoebox-${key}`);
    if (!el) {
      return;
    }
    let valueString = el.textContent;
    if (!valueString) {
      return;
    }

    shoeboxItem = JSON.parse(valueString);
    this[key] = shoeboxItem;

    return shoeboxItem;
  }
}

class FastBootService extends Service {
  isFastBoot = typeof FastBoot !== 'undefined';

  /** @type {Shoebox} */
  shoebox;

  // eslint-disable-next-line getter-return
  get isFastboot() {
    assert(
      'The fastboot service does not have an `isFastboot` property. This is likely a typo. Please use `isFastBoot` instead.',
      false
    );
  }

  constructor(owner) {
    super(owner);
    this.shoebox = new Shoebox(this);
  }

  get response() {
    return this._fastbootInfo?.response;
  }

  get metadata() {
    return this._fastbootInfo?.metadata;
  }

  #request;
  get request() {
    if (!this.isFastBoot) return null;
    if (!this.#request) {
      // eslint-disable-next-line ember/no-side-effects
      this.#request = RequestObject.create(this._fastbootInfo?.request);
    }

    return this.#request;
  }

  #fastbootInfo;

  get _fastbootInfo() {
    if (!this.#fastbootInfo) {
      // eslint-disable-next-line ember/no-side-effects
      this.#fastbootInfo = getOwner(this).lookup('info:-fastboot');
    }

    return this.#fastbootInfo;
  }

  /** @internal */ // Intended for use only in tests!
  set _fastbootInfo(value) {
    this.#fastbootInfo = value;
  }

  deferRendering(promise) {
    assert(
      'deferRendering requires a promise or thennable object',
      typeof promise.then === 'function'
    );
    this._fastbootInfo.deferRendering(promise);
  }
}

export default FastBootService;
