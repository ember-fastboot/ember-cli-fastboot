'use strict';

const EmberApp = require('./lib/ember-app');

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
 * By default, this sandbox is the built-in `VMSandbox` class, which uses
 * Node's `vm` module. You may provide your own sandbox implementation by
 * passing the `sandbox` option.
 *
 * @example
 * const FastBoot = require('fastboot');
 *
 * let app = new FastBoot({
 *   distPath: 'path/to/dist'
 * });
 *
 * app.visit('/photos')
 *   .then(result => result.html())
 *   .then(html => res.send(html));
 */

class FastBoot {
  /**
   * Create a new FastBoot instance.
   * @param {Object} options
   * @param {string} options.distPath the path to the built Ember application
   * @param {Boolean} [options.resilient=false] if true, errors during rendering won't reject the `visit()` promise but instead resolve to a {@link Result}
   * @param {Sandbox} [options.sandbox=VMSandbox] the sandbox to use
   */
  constructor(options) {
    options = options || {};

    this.distPath = options.distPath;
    this.sandbox = options.sandbox;
    this.resilient = !!options.resilient || false;

    this._buildEmberApp(this.distPath);
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
   * @returns {Promise<Result>} result
   */
  visit(path, options) {
    options = options || {};

    let resilient = options.resilient;

    if (resilient === undefined) {
      resilient = this.resilient;
    }

    return this._app.visit(path, options)
      .then(result => {
        if (!resilient && result.error) {
          throw result.error;
        } else {
          return result;
        }
      });
  }

  reload(options) {
    if (this._app) {
      this._app.destroy();
    }

    this._buildEmberApp(options ? options.distPath : null);
  }

  _buildEmberApp(distPath) {
    distPath = distPath || this.distPath;

    if (!distPath) {
      throw new Error('You must instantiate FastBoot with a distPath ' +
                      'option that contains a path to a dist directory ' +
                      'produced by running ember fastboot:build in your Ember app:' +
                      '\n\n' +
                      'new FastBootServer({\n' +
                      '  distPath: \'path/to/dist\'\n' +
                      '});');
    }

    this.distPath = distPath;
    this._app = new EmberApp({
      distPath: distPath
    });
  }

}

module.exports = FastBoot;
