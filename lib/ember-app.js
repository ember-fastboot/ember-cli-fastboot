'use strict';

const fs = require('fs');

const najax = require('najax');
const SimpleDOM = require('simple-dom');
const debug = require('debug')('fastboot:ember-app');
const FastBootInfo = require('./fastboot-info');
const VMSandbox = require('./sandboxes/vm');
const buildWhitelistedRequire = require('./build-whitelisted-require');

const Result = require('./result');

function EmberApp(options) {
  var distPath = options.distPath;

  var appFilePath = options.appFile;
  var vendorFilePath = options.vendorFile;
  var moduleWhitelist = options.moduleWhitelist;
  this._hostWhitelist = options.hostWhitelist;

  debug("app created; app=%s; vendor=%s", appFilePath, vendorFilePath);

  moduleWhitelist.forEach(function(whitelistedModule) {
    debug("module whitelisted; module=%s", whitelistedModule);
  });

  // Create the sandbox, giving it the resolver to resolve once the app
  // has booted.
  var sandboxRequire = buildWhitelistedRequire(moduleWhitelist, distPath);
  var Sandbox = options.sandbox || VMSandbox;
  var sandbox = new Sandbox({
    globals: {
      najax: najax,
      FastBoot: { require: sandboxRequire }
    }
  });

  sandbox.eval('sourceMapSupport.install(Error);');

  var appFile = fs.readFileSync(appFilePath, 'utf8');
  var vendorFile = fs.readFileSync(vendorFilePath, 'utf8');

  sandbox.eval(vendorFile, vendorFilePath);
  debug("vendor file evaluated");

  sandbox.eval(appFile, appFilePath);
  debug("app file evaluated");

  var AppFactory = sandbox.run(function(ctx) {
    return ctx.require('~fastboot/app-factory');
  });

  if (!AppFactory || typeof AppFactory['default'] !== 'function') {
    throw new Error('Failed to load Ember app from ' + appFilePath + ', make sure it was built for FastBoot with the `ember fastboot:build` command.');
  }

  this._app = AppFactory['default']();
}

EmberApp.prototype.destroy = function() {
  if (this._app) {
    this._app.destroy();
  }
};

EmberApp.prototype.buildApp = function() {
  return this._app.boot().then(function(app) {
    debug('building instance');
    return app.buildInstance();
  });
};

/*
 * Called by an HTTP server to render the app at a specific URL.
 */
EmberApp.prototype.visit = function(path, options) {
  let req = options.request;
  let res = options.response;
  let html = options.html;

  var bootOptions = buildBootOptions();
  var doc = bootOptions.document;
  var rootElement = bootOptions.rootElement;

  return this.buildApp()
    .then(registerFastBootInfo(req, res, this._hostWhitelist))
    .then(function(instance) {
      return instance.boot(bootOptions);
    })
    .then(function(instance) {
      return instance.visit(path, bootOptions);
    })
    .then(function(instance) {
      var fastbootInfo = instance.lookup('info:-fastboot');

      return fastbootInfo.deferredPromise.then(function() {
        return instance;
      });
    })
    .then(function(instance) {
      let result;

      try {
        result = new Result(instance, html, doc, rootElement);
      } finally {
        instance.destroy();
      }

      return result;
    });
};

/*
 * Builds an object with the options required to boot an ApplicationInstance in
 * FastBoot mode.
 */
function buildBootOptions() {
  var doc = new SimpleDOM.Document();
  var rootElement = doc.body;

  return {
    isBrowser: false,
    document: doc,
    rootElement: rootElement
  };
}

/*
 * Builds a new FastBootInfo instance with the request and response and injects
 * it into the application instance.
 */
function registerFastBootInfo(req, res, hostWhitelist) {
  return function(instance) {
    var info = new FastBootInfo(req, res, hostWhitelist);
    info.register(instance);

    return instance;
  };
}

module.exports = EmberApp;
