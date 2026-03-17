/* eslint-disable ember/no-classic-classes, ember/no-get, ember/require-computed-property-dependencies, prettier/prettier */
import { computed, get } from '@ember/object';
import { bool, readOnly } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application'
import NoneLocation from '@ember/routing/none-location'

const TEMPORARY_REDIRECT_CODE = 307;

export default NoneLocation.extend({
  implementation: 'fastboot',
  fastboot: service(),

  _config: computed(function () {
    return getOwner(this).resolveRegistration('config:environment');
  }),

  _fastbootHeadersEnabled: bool('_config.fastboot.fastbootHeaders'),

  _redirectCode: computed(function () {
    return get(this, '_config.fastboot.redirectCode') || TEMPORARY_REDIRECT_CODE;
  }),

  _response: readOnly('fastboot.response'),
  _request: readOnly('fastboot.request'),

  setURL(path) {
    if (get(this, 'fastboot.isFastBoot')) {
      let response = get(this, '_response');
      let currentPath = get(this, 'path');
      let isInitialPath = !currentPath || currentPath.length === 0;

      if (!isInitialPath) {
        path = this.formatURL(path);
        let isTransitioning = currentPath !== path;

        if (isTransitioning) {
          let host = get(this, '_request.host');
          let redirectURL = `//${host}${path}`;

          response.statusCode = this.get('_redirectCode');
          response.headers.set('location', redirectURL);
        }
      }

      // for testing and debugging
      if (get(this, '_fastbootHeadersEnabled')) {
        response.headers.set('x-fastboot-path', path);
      }
    }

    this._super(...arguments);
  }
});
