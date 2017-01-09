import Ember from 'ember';

const {
  computed,
  computed: { reads },
  inject: { service },
  get,
  getOwner
} = Ember;

export default Ember.NoneLocation.extend({
  implementation: 'fastboot',
  fastboot: service(),

  _config: computed(function () {
    return getOwner(this).resolveRegistration('config:environment');
  }),

  _fastbootHeadersEnabled: computed(function () {
    return !!get(this, '_config.fastboot.fastbootHeaders');
  }),

  _redirectCode: computed(function () {
    const TEMPORARY_REDIRECT_CODE = 307;
    return get(this, '_config.fastboot.redirectCode') || TEMPORARY_REDIRECT_CODE;
  }),

  _response: reads('fastboot.response'),
  _request: reads('fastboot.request'),

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
