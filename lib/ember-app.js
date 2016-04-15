var fs = require('fs');
var path = require('path');

var SimpleDOM = require('simple-dom');
var najax = require('najax');
var debug   = require('debug')('ember-cli-fastboot:ember-app');
var FastBootInfo = require('./fastboot-info');
var Sandbox = require('./sandbox');

var HTMLSerializer = new SimpleDOM.HTMLSerializer(SimpleDOM.voidMap);

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
    return app.buildInstance();
  });
};

/*
 * Called by an HTTP server to render the app at a specific URL.
 */
EmberApp.prototype.visit = function(path, options) {
  var req = options.request;
  var res = options.response;

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
    .then(serializeHTML(doc, rootElement));
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

/*
 * After the ApplicationInstance has finished rendering, serializes the
 * resulting DOM element into HTML to be transmitted back to the user agent.
 */
function serializeHTML(doc, rootElement) {
  return function(instance) {
    var head;

    if (doc.head) {
      head = HTMLSerializer.serializeChildren(doc.head);
    }

    try {
      return {
        url: instance.getURL(), // TODO: use this to determine whether to 200 or redirect
        title: doc.title,
        head: head,
        body: HTMLSerializer.serializeChildren(rootElement)
      };
    } finally {
      instance.destroy();
    }
  };
}

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
