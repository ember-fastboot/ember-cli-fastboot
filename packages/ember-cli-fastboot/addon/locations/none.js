import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import NoneLocation from '@ember/routing/none-location';

const TEMPORARY_REDIRECT_CODE = 307;

export default class FastbootLocation extends NoneLocation {
  implementation = 'fastboot';

  @service fastboot;

  #config;
  get _config() {
    return (
      this.#config ??
      (this.#config = getOwner(this).resolveRegistration('config:environment'))
    );
  }

  get _fastbootHeadersEnabled() {
    return this._config.fastboot.fastbootHeaders;
  }

  get _redirectCode() {
    return this._config.fastboot.redirectCode || TEMPORARY_REDIRECT_CODE;
  }

  get _response() {
    return this.fastboot.response;
  }
  get _request() {
    return this.fastboot.request;
  }

  setURL(path) {
    if (this.fastboot.isFastBoot) {
      let response = this._response;
      let currentPath = this.path;
      let isInitialPath = !currentPath || currentPath.length === 0;

      if (!isInitialPath) {
        path = this.formatURL(path);
        let isTransitioning = currentPath !== path;

        if (isTransitioning) {
          let host = this._request.host;
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

    super.setURL(...arguments);
  }
}
