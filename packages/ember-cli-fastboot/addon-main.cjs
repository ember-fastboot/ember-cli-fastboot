'use strict';

const { existsSync } = require('node:fs');
const path = require('node:path');
const { addonV1Shim } = require('@embroider/addon-shim');

const shim = addonV1Shim(__dirname);

/**
 * Hooks for classic (ember-cli and broccoli) builds.
 * Vite builds do not call them.
 */
module.exports = {
  ...shim,

  included(app, ...rest) {
    /**
     * The shim's `included` calls `this._super.included`.
     * ember-cli sets `this._super` only for a method whose source text has `_super`,
     * and this comment is that text.
     */
    shim.included.call(this, app, ...rest);

    /**
     * In a classic build, `contentFor('app-boot')` boots the app instead,
     * so that it can take over a page that the server rendered.
     *
     * Embroider builds do not run addon app-boot code.
     * There, `index.html` calls `boot()` from `ember-cli-fastboot/boot`.
     */
    this._classicBoot = !usesEmbroider(this.project);

    if (this._classicBoot) {
      app.options.autoRun = false;
    }
  },

  contentFor(type, config) {
    if (type === 'head') return '<!-- FASTBOOT_HEAD -->';
    if (type === 'body') return '<!-- FASTBOOT_BODY -->';

    if (type === 'app-boot' && this._classicBoot) {
      const { boot } = require('./src/boot.js');

      const prefix = JSON.stringify(config.modulePrefix);

      return [
        'if (!runningTests) {',
        `  (${boot.toString()})(require(${prefix} + "/app").default, require(${prefix} + "/config/environment").default);`,
        '}',
      ].join('\n');
    }
  },

  /**
   * `ember serve` renders pages with FastBoot.
   * Add `?fastboot=false` to a URL, or set `FASTBOOT_DISABLED=true`, to get the page without it.
   */
  serverMiddleware({ app }) {
    app.use(async (req, res, next) => {
      let enabled = !process.env.FASTBOOT_DISABLED && req.query?.fastboot !== 'false';
      let outputPath = req.headers['x-broccoli']?.outputPath;

      if (!req.serveUrl || !enabled || !outputPath) {
        next();
        return;
      }

      try {
        if (!this._fastboot) {
          const { default: FastBoot } = await import('fastboot');

          this._fastboot = new FastBoot({ workers: 1, ...this._fastbootOptions(), distPath: outputPath });
          this.ui.writeLine('Pages are rendered by FastBoot');
        }

        const { default: fastbootMiddleware } = await import('fastboot/middleware');

        await fastbootMiddleware(this._fastboot)(req, res, next);
      } catch (error) {
        next(error);
      }
    });
  },

  postBuild(result) {
    this._fastboot?.reload({ distPath: result.directory });
  },

  /**
   * Options for `new FastBoot()` from `config/fastboot.js` of the app.
   * That file exports a function of the environment, the same as `config/environment.js`.
   */
  _fastbootOptions() {
    const configPath = path.join(path.dirname(this.project.configPath()), 'fastboot.js');

    return existsSync(configPath) ? require(configPath)(this.app.env) : {};
  },
};

function usesEmbroider(project) {
  let { dependencies = {}, devDependencies = {} } = project.pkg;

  return '@embroider/compat' in dependencies || '@embroider/compat' in devDependencies;
}
