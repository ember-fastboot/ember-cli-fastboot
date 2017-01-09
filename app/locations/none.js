import Ember from 'ember';

const {
  computed,
  computed: { bool, readOnly },
  inject: { service },
  get,
  getOwner
} = Ember;

const TEMPORARY_REDIRECT_CODE = 307;

export default Ember.NoneLocation.extend({
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
      const currentPath = get(this, 'path');
      const isInitialPath = !currentPath || currentPath.length === 0;
      const isTransitioning = currentPath !== path;
      let response = get(this, '_response');

      if (isTransitioning && !isInitialPath) {
        let protocol = get(this, '_request.protocol');
        let host = get(this, '_request.host');
        let redirectURL = `${protocol}://${host}${path}`;

        response.statusCode = this.get('_redirectCode');
        response.headers.set('location', redirectURL);
      }

      // for testing and debugging
      if(get(this, '_fastbootHeadersEnabled')) {
        response.headers.set('x-fastboot-path', path);
      }
    }

    this._super(...arguments);
  }
});
