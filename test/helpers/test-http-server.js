var express = require('express');
var RSVP = require('rsvp');
var FastBoot = require('../../index');

function TestHTTPServer(options) {
  options = options || {};

  options.ui = options.ui || {
    writeLine: function() { }
  };

  this.options = options;
}

TestHTTPServer.prototype.start = function() {
  var options = this.options;
  var server = new FastBoot(options);
  var self = this;

  this.server = server;

  return server._app.buildAppInstance().then(function() {
    var app = express();

    app.get('/*', server.middleware());

    return new RSVP.Promise(function(resolve, reject) {
      var listener = app.listen(options.port, options.host, function() {
        var host = listener.address().address;
        var port = listener.address().port;
        var family = listener.address().family;

        self.listener = listener;

        resolve({
          host: host,
          port: port,
          server: server,
          listener: listener
        });
      });
    });
  });
};

TestHTTPServer.prototype.withFastBoot = function(cb) {
  return cb(this.server);
};

TestHTTPServer.prototype.stop = function() {
  if (this.listener) {
    this.listener.close();
  }
};

module.exports = TestHTTPServer;
