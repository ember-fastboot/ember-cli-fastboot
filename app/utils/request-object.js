import EObject from '@ember/object';
import { computed } from '@ember/object';

export default EObject.extend({
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
    if(typeof this._host === 'function') {
      return this._host();
    }
  })
});