var express = require('express');
var chalk = require('chalk');

function FastBootServer(options) {
  this.app = options.app;
  this.port = options.port;
  this.ui = options.ui;
}

FastBootServer.prototype.start = function() {
  var app = express();
  var self = this;

  app.get("/*", function(req, res) {
    var path = req.path;

    self.app.waitForBoot().then(function(handleURL) {
      handleURL(req.path).then(success, failure);

      function success(html) {
        self.log(200, 'OK ' + path);
        res.send(html);
      }

      function failure(error) {
        if (error.name === "UnrecognizedURLError") {
          self.log(404, "Not Found " + path);
          res.sendStatus(400);
        } else {
          console.log(error.stack);
          self.log(500, "Unknown Error: " + error);
          res.sendStatus(500);
        }
      }
    }, function(err) {
      self.ui.writeLine(chalk.red("Error loading the application."));
      self.ui.writeLine(err);
    });
  });

  var server = app.listen(this.port, function() {
    var host = server.address().address;
    var port = server.address().port;

    self.ui.writeLine('Ember FastBoot running at http://' + host + ":" + port);
  });
};

FastBootServer.prototype.log = function(statusCode, message) {
  var color = statusCode === 200 ? 'green' : 'red';

  this.ui.writeLine(chalk[color](statusCode) + " " + message);
};

module.exports = FastBootServer;
