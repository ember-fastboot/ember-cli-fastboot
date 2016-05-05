var chalk    = require('chalk');
var fs       = require('fs');
var path     = require('path');
var util     = require('util');
var EmberApp = require('./ember-app');
var debug    = require('debug')('ember-cli-fastboot:server');

detectDeprecatedNode();

function FastBootServer(options) {
  options = options || {};

  var distPath = options.distPath;
  var ui = options.ui;

  this.buildEmberApp(distPath, ui);
}

// Stubs out the `ui` object for printing to the terminal used
// by Ember CLI addons.

var defaultUI = {
  writeLine: function() {
    console.log.apply(console, arguments);
  }
};

FastBootServer.prototype.buildEmberApp = function(distPath, ui) {
  if (!distPath) {
    throw new Error('You must instantiate FastBootServer with a distPath ' +
                    'option that contains a path to a fastboot-dist directory ' +
                    'produced by running ember fastboot:build in your Ember app:' +
                    '\n\n' +
                    'new FastBootServer({\n' +
                    '  distPath: \'path/to/fastboot-dist\'\n' +
                    '});');
  }

  var config = readPackageJSON(distPath);

  if (!ui) {
    ui = this.ui || defaultUI;
  }

  this.distPath = distPath;
  this.ui = ui;

  if (this.app) {
    this.app.destroy();
  }

  this.app = new EmberApp({
    distPath: path.resolve(distPath),
    appFile: config.appFile,
    vendorFile: config.vendorFile,
    moduleWhitelist: config.moduleWhitelist,
    hostWhitelist: config.hostWhitelist,
    appConfig: config.appConfig
  });

  this.html = fs.readFileSync(config.htmlFile, 'utf8');
};

FastBootServer.prototype.log = function(statusCode, message, startTime) {
  var color = statusCode === 200 ? 'green' : 'red';
  var now = new Date();

  if (startTime) {
    var diff = Date.now() - startTime;
    message = message + chalk.blue(" " + diff + "ms");
  }

  this.ui.writeLine(chalk.blue(now.toISOString()) + " " + chalk[color](statusCode) + " " + message);
};

FastBootServer.prototype.insertIntoIndexHTML = function(title, body, head) {
  var html = this.html.replace("<!-- EMBER_CLI_FASTBOOT_BODY -->", body);

  if (title) {
    html = html.replace("<!-- EMBER_CLI_FASTBOOT_TITLE -->", "<title>" + title + "</title>");
  }
  if (head) {
    html = html.replace("<!-- EMBER_CLI_FASTBOOT_HEAD -->", head);
  }

  return html;
};

FastBootServer.prototype.handleSuccess = function(res, path, result, startTime) {
  var contentFor = result.contentFor;
  var headers = result.headers;

  this.log(result.statusCode, 'OK ' + path, startTime);

  for (var pair of headers.entries()) {
    res.set(pair[0], pair[1]);
  }
  res.status(result.statusCode);
  res.send(this.insertIntoIndexHTML(contentFor.title, contentFor.body, contentFor.head));
};

FastBootServer.prototype.handleFailure = function(res, path, error, startTime) {
  if (error.name === "UnrecognizedURLError") {
    this.log(404, "Not Found " + path, startTime);
    res.sendStatus(404);
  } else {
    console.log(error.stack);
    this.log(500, "Unknown Error: " + error, startTime);
    res.sendStatus(500);
  }
};

FastBootServer.prototype.handleAppBootFailure = function(error) {
  debug("app boot failed");
  this.ui.writeLine(chalk.red("Error loading the application."));
  this.ui.writeLine(error);
};

FastBootServer.prototype.middleware = function() {
  return function(req, res) {
    var path = req.url;
    debug("middleware request; path=%s", path);

    var server = this;

    debug("handling url; url=%s", path);

    var startTime = Date.now();

    this.app.visit(path, { request: req, response: res })
      .then(success, failure)
      .finally(function() {
        debug("finished handling; url=%s", path);
      });

    function success(result) {
      server.handleSuccess(res, path, result, startTime);
    }

    function failure(error) {
      server.handleFailure(res, path, error, startTime);
    }
  }.bind(this);
};

FastBootServer.prototype.reload = function(options) {
  var distPath = this.distPath;

  if (options && options.distPath) {
    distPath = options.distPath;
  }

  this.buildEmberApp(distPath);
};

function readPackageJSON(distPath) {
  var pkgPath = path.join(distPath, 'package.json');
  var file;

  try {
    file = fs.readFileSync(pkgPath);
  } catch (e) {
    throw new Error(util.format("Couldn't find %s. You may need to update your version of ember-cli-fastboot.", pkgPath));
  }

  var manifest;
  var pkg;

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
    hostWhitelist: pkg.fastboot.hostWhitelist,
    appConfig: pkg.fastboot.appConfig
  };
}

function detectDeprecatedNode() {
  var version = process.version.match(/^v(\d+)\.(\d+)/);

  var major = parseInt(version[1]);
  var minor = parseInt(version[2]);

  if (major === 0 && minor <= 10) {
    console.log("Support for Node.js 0.10 has been deprecated and will be removed before the 1.0 release. Please upgrade to Node.js 0.12 or later.");
  }
}

module.exports = FastBootServer;
