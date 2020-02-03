/* global FastBoot */
import { deprecate } from '@ember/application/deprecations';
import { computed, get } from '@ember/object';
import { deprecatingAlias, readOnly } from '@ember/object/computed';
import { assert } from '@ember/debug';
import Service from '@ember/service';
import RequestObject from '../utils/request-object';
import Shoebox from '../utils/shoebox';

const FastBootService = Service.extend({
  cookies: deprecatingAlias('request.cookies', { id: 'fastboot.cookies-to-request', until: '0.9.9' }),
  headers: deprecatingAlias('request.headers', { id: 'fastboot.headers-to-request', until: '0.9.9' }),
  isFastBoot: typeof FastBoot !== 'undefined',

  init() {
    this._super(...arguments);

    let shoebox = Shoebox.create({ fastboot: this });
    this.set('shoebox', shoebox);
  },

  host: computed(function() {
    deprecate(
      'Usage of fastboot service\'s `host` property is deprecated.  Please use `request.host` instead.',
      false,
      { id: 'fastboot.host-to-request', until: '0.9.9' }
    );

    return this._fastbootInfo.request.host();
  }),

  response: readOnly('_fastbootInfo.response'),
  metadata: readOnly('_fastbootInfo.metadata'),

  request: computed(function() {
    if (!this.isFastBoot) return null;
    return RequestObject.create({ request: get(this, '_fastbootInfo.request') });
  }),

  deferRendering(promise) {
    assert('deferRendering requires a promise or thennable object', typeof promise.then === 'function');
    this._fastbootInfo.deferRendering(promise);
  }
});

export default FastBootService;
