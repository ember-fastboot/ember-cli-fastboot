var fs = require('fs');
var path = require('path');

var createSandbox = require('./sandbox').createSandbox;
var runInSandbox = require('./sandbox').runInSandbox;
var SimpleDOM = require('simple-dom');
var RSVP    = require('rsvp');
var chalk = require('chalk');
var najax = require('najax');
var debug   = require('debug')('ember-cli-fastboot:ember-app');
var emberDebug = require('debug')('ember-cli-fastboot:ember');

var HTMLSerializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

function EmberApp(options) {
  var distPath = options.distPath;

  var appFilePath = options.appFile;
  var vendorFilePath = options.vendorFile;
  var moduleWhitelist = options.moduleWhitelist;

  debug("app created; app=%s; vendor=%s", appFilePath, vendorFilePath);

  moduleWhitelist.forEach(function(whitelistedModule) {
    debug("module whitelisted; module=%s", whitelistedModule);
  });

  // Create the sandbox, giving it the resolver to resolve once the app
  // has booted.
  var sandboxRequire = buildWhitelistedRequire(moduleWhitelist, distPath);
  var sandbox = createSandbox({
    najax: najax,
    FastBoot: { require: sandboxRequire }
  });

  runInSandbox(vendorFilePath, sandbox);
  debug("vendor file evaluated");

  runInSandbox(appFilePath, sandbox);
  debug("app file evaluated");

  var AppFactory = sandbox.require('~fastboot/app-factory');

  if (!AppFactory || typeof AppFactory['default'] !== 'function') {
    throw new Error('Failed to load Ember app from ' + appFilePath + ', make sure it was built for FastBoot with the `ember fastboot:build` command.');
  }

  this._app = AppFactory['default']();
}

EmberApp.prototype.boot = function() {
  return this._app.boot();
};

EmberApp.prototype.visit = function(url) {
  var doc = new SimpleDOM.Document();
  var rootElement = doc.body;
  var options = { isBrowser: false, document: doc, rootElement: rootElement };

  return this._app.visit(url, options).then(function(instance) {
    try {
      return {
        url: instance.getURL(), // TODO: use this to determine whether to 200 or redirect
        title: doc.title,
        body: HTMLSerializer.serialize(rootElement) // This matches the current code; but we probably want `serializeChildren` here
      };
    } finally {
      instance.destroy();
    }
  });
};

function buildWhitelistedRequire(whitelist, distPath) {
  return function(moduleName) {
    if (whitelist.indexOf(moduleName) > -1) {
      return require(path.join(distPath, 'node_modules', moduleName));
    } else {
      throw new Error("Unable to require module '" + moduleName + "' because it was not in the whitelist.");
    }
  };
}

module.exports = EmberApp;
