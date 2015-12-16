var fs = require('fs');

var Contextify = require('contextify');
var SimpleDOM = require('simple-dom');
var RSVP    = require('rsvp');
var chalk = require('chalk');
var najax = require('najax');
var debug   = require('debug')('ember-cli-fastboot:ember-app');
var emberDebug = require('debug')('ember-cli-fastboot:ember');

var HTMLSerializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

function EmberApp(options) {
  var appFilePath = options.appFile;
  var vendorFilePath = options.vendorFile;

  debug("app created; app=%s; vendor=%s", appFilePath, vendorFilePath);

  // Create the sandbox, giving it the resolver to resolve once the app
  // has booted.
  var sandbox = createSandbox({ najax: najax });

  var appFile = fs.readFileSync(appFilePath, 'utf8');
  var vendorFile = fs.readFileSync(vendorFilePath, 'utf8');

  sandbox.run(vendorFile, vendorFilePath);
  debug("vendor file evaluated");

  sandbox.run(appFile, appFilePath);
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

function createSandbox(dependencies) {
  var wrappedConsole =  Object.create(console);
  wrappedConsole.error = function() {
    console.error.apply(console, Array.prototype.map.call(arguments, function(a) {
      return typeof a === 'string' ? chalk.red(a) : a;
    }));
  };

  var sandbox = {
    // Expose the console to the FastBoot environment so we can debug
    console: wrappedConsole,

    // setTimeout is an assumed part of JavaScript environments. Expose it.
    setTimeout: setTimeout,

    // Convince jQuery not to assume it's in a browser
    module: { exports: {} },

    URL: require("url")
  };

  for (var dep in dependencies) {
    sandbox[dep] = dependencies[dep];
  }

  // Set the global as `window`.
  sandbox.window = sandbox;
  sandbox.window.self = sandbox;

  // The sandbox is now a JavaScript context O_o
  Contextify(sandbox);

  return sandbox;
}

module.exports = EmberApp;
