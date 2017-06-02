'use strict';

const fs = require('fs');
const path = require('path');
const RSVP = require('rsvp');
const chalk = require('chalk');

const najax = require('najax');
const SimpleDOM = require('simple-dom');
const existsSync = require('exists-sync');
const debug = require('debug')('fastboot:ember-app');

const FastBootInfo = require('./fastboot-info');
const Result = require('./result');
const FastBootSchemaVersions = require('./fastboot-schema-versions');

/**
 * @private
 *
 * The `EmberApp` class serves as a non-sandboxed wrapper around a sandboxed
 * `Ember.Application`. This bridge allows the FastBoot to quickly spin up new
 * `ApplicationInstances` initialized at a particular route, then destroy them
 * once the route has finished rendering.
 */
class EmberApp {
  /**
   * Create a new EmberApp.
   * @param {Object} options
   * @param {string} options.distPath - path to the built Ember application
   * @param {Sandbox} [options.sandbox=VMSandbox] - sandbox to use
   * @param {Object} [options.sandboxGlobals] - sandbox variables that can be added or used for overrides in the sandbox.
   */
  constructor(options) {
    let distPath = path.resolve(options.distPath);
    let config = this.readPackageJSON(distPath);

    this.appFilePaths = config.appFiles;
    this.vendorFilePaths = config.vendorFiles;
    this.moduleWhitelist = config.moduleWhitelist;
    this.hostWhitelist = config.hostWhitelist;
    this.appConfig = config.appConfig;

    if (process.env.APP_CONFIG) {
      this.appConfig = JSON.parse(process.env.APP_CONFIG);
    }

    this.html = fs.readFileSync(config.htmlFile, 'utf8');

    this.sandbox = this.buildSandbox(distPath, options.sandbox, options.sandboxGlobals);
    this.app = this.retrieveSandboxedApp();
  }

  /**
   * @private
   *
   * Builds and initializes a new sandbox to run the Ember application in.
   *
   * @param {string} distPath path to the built Ember app to load
   * @param {Sandbox} [sandboxClass=VMSandbox] sandbox class to use
   * @param {Object} [sandboxGlobals={}] any additional variables to expose in the sandbox or override existing in the sandbox
   */
  buildSandbox(distPath, sandboxClass, sandboxGlobals) {
    let sandboxRequire = this.buildWhitelistedRequire(this.moduleWhitelist, distPath);
    let config = this.appConfig;
    function appConfig() {
      return { default: config };
    }

    // add any additional user provided variables or override the default globals in the sandbox
    let globals = {
      najax: najax,
      FastBoot: {
        require: sandboxRequire,
        config: appConfig
      }
    };
    for (let key in sandboxGlobals) {
      if (sandboxGlobals.hasOwnProperty(key)) {
        globals[key] = sandboxGlobals[key];
      }
    }

    return new sandboxClass({
      globals: globals
    });
  }

  /**
   * @private
   *
   * The Ember app runs inside a sandbox that doesn't have access to the normal
   * Node.js environment, including the `require` function. Instead, we provide
   * our own `require` method that only allows whitelisted packages to be
   * requested.
   *
   * This method takes an array of whitelisted package names and the path to the
   * built Ember app and constructs this "fake" `require` function that gets made
   * available globally inside the sandbox.
   *
   * @param {string[]} whitelist array of whitelisted package names
   * @param {string} distPath path to the built Ember app
   */
  buildWhitelistedRequire(whitelist, distPath) {
    whitelist.forEach(function(whitelistedModule) {
      debug("module whitelisted; module=%s", whitelistedModule);
    });

    return function(moduleName) {
      if (whitelist.indexOf(moduleName) > -1) {
        let nodeModulesPath = path.join(distPath, 'node_modules', moduleName);

        if (existsSync(nodeModulesPath)) {
          return require(nodeModulesPath);
        } else {
          // If it's not on disk, assume it's a built-in node package
          return require(moduleName);
        }
      } else {
        throw new Error("Unable to require module '" + moduleName + "' because it was not in the whitelist.");
      }
    };
  }

  /**
   * @private
   *
   * Loads the app and vendor files in the sandbox (Node vm).
   *
  */
  loadAppFiles() {
    let sandbox = this.sandbox;
    let appFilePaths = this.appFilePaths;
    let vendorFilePaths = this.vendorFilePaths;

    sandbox.eval('sourceMapSupport.install(Error);');

    debug("evaluating app and vendor files");

    vendorFilePaths.forEach(function(vendorFilePath) {
      debug("evaluating vendor file %s", vendorFilePath);
      let vendorFile = fs.readFileSync(vendorFilePath, 'utf8');
      sandbox.eval(vendorFile, vendorFilePath);
    });
    debug("vendor file evaluated");

    appFilePaths.forEach(function(appFilePath) {
      debug("evaluating app file %s", appFilePath);
      let appFile = fs.readFileSync(appFilePath, 'utf8');
      sandbox.eval(appFile, appFilePath);
    });
    debug("app files evaluated");
  }

  /**
   * @private
   *
   * Create the ember application in the sandbox.
   *
   */
  createEmberApp() {
    let sandbox = this.sandbox;

    // Retrieve the application factory from within the sandbox
    let AppFactory = sandbox.run(function(ctx) {
      return ctx.require('~fastboot/app-factory');
    });

    // If the application factory couldn't be found, throw an error
    if (!AppFactory || typeof AppFactory['default'] !== 'function') {
      throw new Error('Failed to load Ember app from app.js, make sure it was built for FastBoot with the `ember fastboot:build` command.');
    }

    // Otherwise, return a new `Ember.Application` instance
    return AppFactory['default']();
  }

  /**
   * @private
   *
   * Initializes the sandbox by evaluating the Ember app's JavaScript
   * code, then retrieves the application factory from the sandbox and creates a new
   * `Ember.Application`.
   *
   * @returns {Ember.Application} the Ember application from the sandbox
   */
  retrieveSandboxedApp() {
    this.loadAppFiles();

    return this.createEmberApp();
  }

  /**
   * Destroys the app and its sandbox.
   */
  destroy() {
    if (this.app) {
      this.app.destroy();
    }

    this.sandbox = null;
  }

  /**
   * @private
   *
   * Creates a new `ApplicationInstance` from the sandboxed `Application`.
   *
   * @returns {Promise<Ember.ApplicationInstance>} instance
   */
  buildAppInstance() {
    return this.app.boot().then(function(app) {
      debug('building instance');
      return app.buildInstance();
    });
  }

  /**
   * @private
   *
   * Main funtion that creates the app instance for every `visit` request, boots
   * the app instance and then visits the given route and destroys the app instance
   * when the route is finished its render cycle.
   *
   * @param {string} path the URL path to render, like `/photos/1`
   * @param {Object} fastbootInfo An object holding per request info
   * @param {Object} bootOptions An object containing the boot options that are used by
   *                             by ember to decide whether it needs to do rendering or not.
   * @param {Object} result
   * @return {Promise<instance>} instance
   */
  visitRoute(path, fastbootInfo, bootOptions, result) {
    let instance;

    return this.buildAppInstance()
      .then(appInstance => {
        instance = appInstance;
        result.instance = instance;
        registerFastBootInfo(fastbootInfo, instance);

        return instance.boot(bootOptions);
      })
      .then(() => result.instanceBooted = true)
      .then(() => instance.visit(path, bootOptions))
      .then(() => waitForApp(instance))
      .then(() => instance);
  }

  /**
   * Creates a new application instance and renders the instance at a specific
   * URL, returning a promise that resolves to a {@link Result}. The `Result`
   * gives you access to the rendered HTML as well as metadata about the
   * request such as the HTTP status code.
   *
   * If this call to `visit()` is to service an incoming HTTP request, you may
   * provide Node's `ClientRequest` and `ServerResponse` objects as options
   * (e.g., the `res` and `req` arguments passed to Express middleware).  These
   * are provided to the Ember application via the FastBoot service.
   *
   * @param {string} path the URL path to render, like `/photos/1`
   * @param {Object} options
   * @param {string} [options.html] the HTML document to insert the rendered app into
   * @param {Object} [options.metadata] Per request specific data used in the app.
   * @param {Boolean} [options.shouldRender] whether the app should do rendering or not. If set to false, it puts the app in routing-only.
   * @param {Boolean} [options.disableShoebox] whether we should send the API data in the shoebox. If set to false, it will not send the API data used for rendering the app on server side in the index.html.
   * @param {Integer} [options.destroyAppInstanceInMs] whether to destroy the instance in the given number of ms. This is a failure mechanism to not wedge the Node process (See: https://github.com/ember-fastboot/fastboot/issues/90)
   * @param {ClientRequest}
   * @param {ClientResponse}
   * @returns {Promise<Result>} result
   */
  visit(path, options) {
    let req = options.request;
    let res = options.response;
    let html = options.html || this.html;
    let disableShoebox = options.disableShoebox || false;
    let destroyAppInstanceInMs = options.destroyAppInstanceInMs;

    let shouldRender = (options.shouldRender !== undefined) ? options.shouldRender : true;
    let bootOptions = buildBootOptions(shouldRender);
    let fastbootInfo = new FastBootInfo(
      req,
      res,
      { hostWhitelist: this.hostWhitelist, metadata: options.metadata }
    );

    let doc = bootOptions.document;

    let result = new Result({
      doc: doc,
      html: html,
      fastbootInfo: fastbootInfo
    });

    let destroyAppInstanceTimer;
    if (parseInt(destroyAppInstanceInMs, 10) > 0) {
      // start a timer to destroy the appInstance forcefully in the given ms.
      // This is a failure mechanism so that node process doesn't get wedged if the `visit` never completes.
      destroyAppInstanceTimer = setTimeout(function() {
        if (instance && !result.instanceDestroyed) {
          result.instanceDestroyed = true;
          result.error = new Error('App instance was forcefully destroyed in ' + destroyAppInstanceInMs + 'ms');
          instance.destroy();
        }
      }, destroyAppInstanceInMs);
    }

    let instance;
    return this.visitRoute(path, fastbootInfo, bootOptions, result)
      .then(appInstance => {
        instance = appInstance;
      })
      .then(() => {
        if (!disableShoebox) {
          // if shoebox is not disabled, then create the shoebox and send API data
          createShoebox(doc, fastbootInfo);
        }
      })
      .catch(error => result.error = error)
      .then(() => result._finalize())
      .finally(() => {
        if (instance && !result.instanceDestroyed) {
          result.instanceDestroyed = true;
          instance.destroy();

          if (destroyAppInstanceTimer) {
            clearTimeout(destroyAppInstanceTimer);
          }
        }
      });
  }

  /**
   * Given the path to a built Ember app, reads the FastBoot manifest
   * information from its `package.json` file.
   */
  readPackageJSON(distPath) {
    let pkgPath = path.join(distPath, 'package.json');
    let file;

    try {
      file = fs.readFileSync(pkgPath);
    } catch (e) {
      throw new Error(`Couldn't find ${pkgPath}. You may need to update your version of ember-cli-fastboot.`);
    }

    let manifest;
    let schemaVersion;
    let pkg;

    try {
      pkg = JSON.parse(file);
      manifest = pkg.fastboot.manifest;
      schemaVersion = pkg.fastboot.schemaVersion;
    } catch (e) {
      throw new Error(`${pkgPath} was malformed or did not contain a manifest. Ensure that you have a compatible version of ember-cli-fastboot.`);
    }

    const currentSchemaVersion = FastBootSchemaVersions.latest;
    // set schema version to 1 if not defined
    schemaVersion = schemaVersion || FastBootSchemaVersions.base;
    debug('Current schemaVersion from `ember-cli-fastboot` is %s while latest schema version is %s', (schemaVersion, currentSchemaVersion));

    if (schemaVersion > currentSchemaVersion) {
      let errorMsg = chalk.bold.red('An incompatible version between `ember-cli-fastboot` and `fastboot` was found. Please update the version of fastboot library that is compatible with ember-cli-fastboot.');
      throw new Error(errorMsg);
    }

    if (schemaVersion < FastBootSchemaVersions.manifestFileArrays) {
      // transform app and vendor file to array of files
      manifest = this.transformManifestFiles(manifest);
    }

    var appFiles = [];
    debug("reading array of app file paths from manifest");
    manifest.appFiles.forEach(function(appFile) {
      appFiles.push(path.join(distPath, appFile));
    });

    var vendorFiles = [];
    debug("reading array of vendor file paths from manifest");
    manifest.vendorFiles.forEach(function(vendorFile) {
      vendorFiles.push(path.join(distPath, vendorFile));
    });

    return {
      appFiles:  appFiles,
      vendorFiles: vendorFiles,
      htmlFile: path.join(distPath, manifest.htmlFile),
      moduleWhitelist: pkg.fastboot.moduleWhitelist,
      hostWhitelist: pkg.fastboot.hostWhitelist,
      appConfig: pkg.fastboot.appConfig
    };
  }

  /**
   * Function to transform the manifest app and vendor files to an array.
   */
  transformManifestFiles(manifest) {
    manifest.appFiles = [manifest.appFile];
    manifest.vendorFiles = [manifest.vendorFile];

    return manifest;
  }
}

/*
 * Builds an object with the options required to boot an ApplicationInstance in
 * FastBoot mode.
 */
function buildBootOptions(shouldRender) {
  let doc = new SimpleDOM.Document();
  let rootElement = doc.body;

  return {
    isBrowser: false,
    document: doc,
    rootElement,
    shouldRender
  };
}

/*
 * Ember apps can manually defer rendering in FastBoot mode if they're waiting
 * on something async the router doesn't know about.  This function fetches
 * that promise for deferred rendering from the app.
 */
function waitForApp(instance) {
  let fastbootInfo = instance.lookup('info:-fastboot');
  return fastbootInfo.deferredPromise;
}

/*
 * Writes the shoebox into the DOM for the browser rendered app to consume.
 * Uses a script tag with custom type so that the browser will treat as plain
 * text, and not expend effort trying to parse contents of the script tag.
 * Each key is written separately so that the browser rendered app can
 * parse the specific item at the time it is needed instead of everything
 * all at once.
 */
function createShoebox(doc, fastbootInfo) {
  let shoebox = fastbootInfo.shoebox;
  if (!shoebox) { return RSVP.resolve(); }

  for (let key in shoebox) {
    if (!shoebox.hasOwnProperty(key)) { continue; }

    let value = shoebox[key];
    let textValue = JSON.stringify(value);
    textValue = escapeJSONString(textValue);

    let scriptText = doc.createRawHTMLSection(textValue);
    let scriptEl = doc.createElement('script');

    scriptEl.setAttribute('type', 'fastboot/shoebox');
    scriptEl.setAttribute('id', `shoebox-${key}`);
    scriptEl.appendChild(scriptText);
    doc.body.appendChild(scriptEl);
  }

  return RSVP.resolve();
}

const JSON_ESCAPE = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029'
};

const JSON_ESCAPE_REGEXP = /[\u2028\u2029&><]/g;

function escapeJSONString(string) {
  return string.replace(JSON_ESCAPE_REGEXP, function(match) {
    return JSON_ESCAPE[match];
  });
}

/*
 * Builds a new FastBootInfo instance with the request and response and injects
 * it into the application instance.
 */
function registerFastBootInfo(info, instance) {
  info.register(instance);
}

module.exports = EmberApp;
