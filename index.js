"use strict";

const path = require('path');
const fs = require('fs');
const util = require('util');

const EmberApp = require('./lib/ember-app');

class FastBoot {
  constructor(options) {
    options = options || {};

    this.distPath = options.distPath;
    this.ui = options.ui;
    this.sandbox = options.sandbox;
    this.resilient = options.resilient;

    if (!this.ui) {
      this.ui = require('./lib/default-ui');
    }

    this._buildEmberApp(this.distPath);
  }

  visit(path, options) {
    options = options || {};

    options.html = options.html || this.html;

    let visit = this._app.visit(path, options);

    if (this.resilient) {
      visit = visit.catch(() => {
        return {
          html() {
            return options.html;
          }
        };
      });
    }

    return visit;
  }

  middleware() {
    const middleware = require('./lib/middleware');
    return middleware(this);
  }

  reload(options) {
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

    let ui = this.ui;
    let config = this._readPackageJSON(distPath);

    this.distPath = distPath;
    this.ui = ui;

    if (this._app) {
      this._app.destroy();
    }

    this._app = new EmberApp({
      distPath: path.resolve(distPath),
      appFile: config.appFile,
      vendorFile: config.vendorFile,
      moduleWhitelist: config.moduleWhitelist,
      hostWhitelist: config.hostWhitelist
    });

    this.html = fs.readFileSync(config.htmlFile, 'utf8');
  }


  _readPackageJSON(distPath) {
    let pkgPath = path.join(distPath, 'package.json');
    let file;

    try {
      file = fs.readFileSync(pkgPath);
    } catch (e) {
      throw new Error(util.format("Couldn't find %s. You may need to update your version of ember-cli-fastboot.", pkgPath));
    }

    let manifest;
    let pkg;

    try {
      pkg = JSON.parse(file);
      manifest = pkg.fastboot.manifest;
    } catch (e) {
      throw new Error(util.format("%s was malformed or did not contain a manifest. Ensure that you have a compatible version of ember-cli-fastboot.", pkgPath));
    }

    return {
      appFile:  path.join(distPath, manifest.appFile),
      vendorFile: path.join(distPath, manifest.vendorFile),
      htmlFile: path.join(distPath, manifest.htmlFile),
      moduleWhitelist: pkg.fastboot.moduleWhitelist,
      hostWhitelist: pkg.fastboot.hostWhitelist
    };
  }
}

module.exports = FastBoot;
