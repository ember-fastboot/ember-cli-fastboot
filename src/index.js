'use strict';

const EmberApp = require('./ember-app');

/**
 * FastBoot renders your Ember.js applications in Node.js. Start by
 * instantiating this class with the path to your compiled Ember app:
 *
 *
 * #### Sandboxing
 *
 * For security and correctness reasons, Ember applications running in FastBoot
 * are run inside a sandbox that prohibits them from accessing the normal
 * Node.js environment.
 *
 * This sandbox is the built-in `VMSandbox` class, which uses
 * Node's `vm` module. You may add and/or override sandbox variables by
 * passing the `addOrOverrideSandboxGlobals` option.
 *
 * @example
 * const FastBoot = require('fastboot');
 *
 * let app = new FastBoot({
 *   distPath: 'path/to/dist',
 *   buildSandboxGlobals(globals) {
 *     return Object.assign({}, globals, {
 *       // custom globals
 *     });
 *   },
 * });
 *
 * app.visit('/photos')
 *   .then(result => result.html())
 *   .then(html => res.send(html));
 */
class FastBoot {
  /**
   * Create a new FastBoot instance.
   *
   * @param {Object} options
   * @param {string} options.distPath the path to the built Ember application
   * @param {Boolean} [options.resilient=false] if true, errors during rendering won't reject the `visit()` promise but instead resolve to a {@link Result}
   * @param {Function} [options.buildSandboxGlobals] a function used to build the final set of global properties setup within the sandbox
   */
  constructor(options = {}) {
    let { distPath, buildSandboxGlobals } = options;

    this.resilient = 'resilient' in options ? Boolean(options.resilient) : false;

    this.distPath = distPath;

    // deprecate the legacy path, but support it
    if (buildSandboxGlobals === undefined && options.sandboxGlobals !== undefined) {
      console.warn(
        '[DEPRECATION] Instantiating `fastboot` with a `sandboxGlobals` option has been deprecated. Please migrate to specifying `buildSandboxGlobals` instead.'
      );
      buildSandboxGlobals = globals => Object.assign({}, globals, options.sandboxGlobals);
    }

    this.buildSandboxGlobals = buildSandboxGlobals;

    this._buildEmberApp(this.distPath, this.buildSandboxGlobals);
  }

  /**
   * Renders the Ember app at a specific URL, returning a promise that resolves
   * to a {@link Result}, giving you access to the rendered HTML as well as
   * metadata about the request such as the HTTP status code.
   *
   * @param {string} path the URL path to render, like `/photos/1`
   * @param {Object} options
   * @param {Boolean} [options.resilient] whether to reject the returned promise if there is an error during rendering. Overrides the instance's `resilient` setting
   * @param {string} [options.html] the HTML document to insert the rendered app into. Uses the built app's index.html by default.
   * @param {Object} [options.metadata] per request meta data that need to be exposed in the app.
   * @param {Boolean} [options.shouldRender] whether the app should do rendering or not. If set to false, it puts the app in routing-only.
   * @param {Boolean} [options.disableShoebox] whether we should send the API data in the shoebox. If set to false, it will not send the API data used for rendering the app on server side in the index.html.
   * @param {Integer} [options.destroyAppInstanceInMs] whether to destroy the instance in the given number of ms. This is a failure mechanism to not wedge the Node process (See: https://github.com/ember-fastboot/fastboot/issues/90)
   * @returns {Promise<Result>} result
   */
  async visit(path, options = {}) {
    let resilient = 'resilient' in options ? options.resilient : this.resilient;

    let result = await this._app.visit(path, options);

    if (!resilient && result.error) {
      throw result.error;
    } else {
      return result;
    }
  }

  /**
   * Destroy the existing Ember application instance, and recreate it from the provided dist path.
   * This is commonly done when `dist` has been updated, and you need to prepare to serve requests
   * with the updated assets.
   *
   * @param {Object} options
   * @param {string} options.distPath the path to the built Ember application
   */
  reload({ distPath }) {
    if (this._app) {
      this._app.destroy();
    }

    this._buildEmberApp(distPath);
  }

  _buildEmberApp(distPath = this.distPath, buildSandboxGlobals = this.buildSandboxGlobals) {
    if (!distPath) {
      throw new Error(
        'You must instantiate FastBoot with a distPath ' +
          'option that contains a path to a dist directory ' +
          'produced by running ember fastboot:build in your Ember app:' +
          '\n\n' +
          'new FastBootServer({\n' +
          "  distPath: 'path/to/dist'\n" +
          '});'
      );
    }

    this.distPath = distPath;

    this._app = new EmberApp({
      distPath,
      buildSandboxGlobals,
    });
  }
}

module.exports = FastBoot;
