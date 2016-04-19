/* global FastBoot */
import Ember from "ember";

const { deprecate, computed, get } = Ember;
const { alias, deprecatingAlias } = computed;

const RequestObject = Ember.Object.extend({
  init() {
    this._super(...arguments);

    let request = this.request;
    delete this.request;

    this.cookies = request.cookies;
    this.headers = request.headers;
    this.queryParams = request.queryParams;
    this.path = request.path;
    this.protocol = request.protocol;
    this._host = function() {
      return request.host();
    }
  },

  host: computed(function() {
    return this._host();
  })
});

export default Ember.Service.extend({
  cookies: deprecatingAlias('cookies', 'request.cookies', { id: 'fastboot.cookies-to-request', until: '0.9.9' }),
  headers: deprecatingAlias('headers', 'request.headers', { id: 'fastboot.cookies-to-request', until: '0.9.9' }),

  host: computed(function() {
    deprecate(
      'Usage of fastboot service\'s `host` property is deprecated.  Please use `request.host` instead.',
      false,
      { id: 'fastboot.host-to-request', until: '0.9.9' }
    );

    return this._fastbootInfo.request.host();
  }),

  request: computed(function() {
    return RequestObject.create({ request: get(this, '_fastbootInfo.request') });
  }),

  isFastBoot: computed(function() {
    return typeof FastBoot !== 'undefined';
  })
});
