var RSVP         = require('rsvp');
var childProcess = require('child_process');
var path         = require('path');
var fixturePath  = require('./fixture-path');
const debug = require('debug')('fastboot:cli-server');
var binPath      = path.join(__dirname, '../../bin/ember-fastboot');

function Server(fixture, options) {
  if (typeof fixture === 'object') {
    options = fixture;
  }

  options = options || {};

  this.path = options.path || fixturePath(fixture);
  this.args = [this.path];

  if (options.args) {
    this.args = this.args.concat(options.args);
  }
}

Server.prototype.start = function() {
  var server = this.server = childProcess.spawn(binPath, this.args);

  this.stdout = server.stdout;
  this.stdin = server.stdin;

  return new RSVP.Promise(function(resolve, reject) {

    server.stdout.on('data', function(data) {
      debug(data.toString());
      if (data.toString().match(/Ember FastBoot running at /)) {
        resolve();
      }
    });

    server.stderr.on('data', function(data) {
      console.error(data.toString());
      reject();
    });

    server.on('exit', function(statusCode, signal) {
      if (signal === 'SIGTERM' || statusCode === 143) {
        resolve();
        return;
      }

      console.error('Server exited unexpectedly: ' + signal + ' ' + statusCode);
      reject();
    });
  });
};

Server.prototype.stop = function() {
  this.server.kill();
};

Server.prototype.reload = function(si) {
  var server = this.server;

  return new RSVP.Promise(function(resolve, reject) {
    server.stdout.on('data', function(data) {
      if (data.toString().match('Reloading Ember app')) {
        resolve();
      }
    });

    server.kill('SIGUSR1');
  });
};

module.exports = Server;
