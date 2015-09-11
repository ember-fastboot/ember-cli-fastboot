var chalk = require('chalk');
var fs = require('fs');
var EmberApp = require('./ember-app');
var debug   = require('debug')('ember-cli-fastboot:server');

function FastBootServer(options) {
  this.app = new EmberApp({
    appFile: options.appFile,
    vendorFile: options.vendorFile
  });

  this.htmlChunks = this.getChunks(fs.readFileSync(options.htmlFile, 'utf8'));

  this.ui = options.ui;
}

FastBootServer.prototype.log = function(statusCode, message) {
  var color = statusCode === 200 ? 'green' : 'red';

  this.ui.writeLine(chalk[color](statusCode) + " " + message);
};

FastBootServer.prototype.getChunks = function getChunks(html) {
  return html.split(/<!-- (EMBER_CLI_FASTBOOT_\w+) -->/g);
};

FastBootServer.prototype.getChunk = function getChunk(type, result) {
  var resultProp = type.slice(19).toLowerCase();
  var output;

  if (result.title && resultProp === 'title') {
    output = "<title>" + result.title + "</title>";
  } else {
    output = result[resultProp] || type;
  }

  return output;
};

FastBootServer.prototype.handleSuccess = function(res, path, result) {
  this.log(200, 'OK ' + path);
  res.type('html');
  res.status(200);

  var chunks = this.htmlChunks;
  for (var i = 0, l = chunks.length; i < l; i++) {
    var chunk = this.getChunk(chunks[i], result);

    res.write(chunk);
  }
  res.end();
};

FastBootServer.prototype.handleFailure = function(res, path, error) {
  if (error.name === "UnrecognizedURLError") {
    this.log(404, "Not Found " + path);
    res.sendStatus(404);
  } else {
    console.log(error.stack);
    this.log(500, "Unknown Error: " + error);
    res.sendStatus(500);
  }
};

FastBootServer.prototype.handleAppBootFailure = function(error) {
  debug("app boot failed");
  self.ui.writeLine(chalk.red("Error loading the application."));
  self.ui.writeLine(error);
};

FastBootServer.prototype.middleware = function() {
  return function(req, res, next) {
    var path = req.path;
    debug("middleware request; path=%s", path);

    var server = this;

    this.app.waitForBoot().then(function(handleURL) {
      debug("handling url; url=%s", path);
      handleURL(path).then(
        success, failure
      ).finally(function() {
        debug("finished handling; url=%s", path);
      });
    })
    .catch(failure);

    function success(result) {
      server.handleSuccess(res, path, result);
    }

    function failure(error) {
      server.handleFailure(res, path, error);
    }
  }.bind(this);
};

module.exports = FastBootServer;
