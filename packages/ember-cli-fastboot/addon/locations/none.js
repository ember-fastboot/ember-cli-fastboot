import { computed, get } from '@ember/object';
import { bool, readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import NoneLocation from '@ember/routing/none-location';

const TEMPORARY_REDIRECT_CODE = 307;

export default NoneLocation.extend({
  implementation: 'fastboot',
  fastboot: service(),

  _config: computed(function () {
    return getOwner(this).resolveRegistration('config:environment');
  }),

  _fastbootHeadersEnabled: bool('_config.fastboot.fastbootHeaders'),

  _redirectCode: computed('_config.fastboot.redirectCode', function () {
    return (
      get(this, '_config.fastboot.redirectCode') || TEMPORARY_REDIRECT_CODE
    );
  }),

  _response: readOnly('fastboot.response'),
  _request: readOnly('fastboot.request'),

  setURL(path) {
    if (get(this, 'fastboot.isFastBoot')) {
      let response = this._response;
      let currentPath = this.path;
      let isInitialPath = !currentPath || currentPath.length === 0;

      if (!isInitialPath) {
        path = this.formatURL(path);
        let isTransitioning = currentPath !== path;

        if (isTransitioning) {
          let host = get(this, '_request.host');
          let redirectURL = `//${host}${path}`;

          response.statusCode = this._redirectCode;
          response.headers.set('location', redirectURL);
        }
      }

      // for testing and debugging
      if (this._fastbootHeadersEnabled) {
        response.headers.set('x-fastboot-path', path);
      }
    }

    this._super(...arguments);
  },
});
