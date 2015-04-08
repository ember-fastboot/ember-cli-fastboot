// node:true

var RSVP = require('rsvp');
var Promise = RSVP.Promise;
var path = require('path');
var runCommand = require('ember-cli/tests/helpers/run-command');

module.exports = function runServer(callback, options) {
  options = options || { port: '49741'};

  var commandOptions = {
    verbose: true,

    onOutput: function(output, child) {
      console.log('output: ' + output);

      if (output.indexOf('Ember FastBoot running at') > -1) {
        callback(child);
      }
    }
  };

  return new Promise(function(resolve, reject) {
    runCommand(path.join('.', 'node_modules', 'ember-cli', 'bin', 'ember'),
      'fastboot', '--port', options.port, commandOptions)
      .then(function() {
        throw new Error('The server should not have exited successfully.');
      })
      .catch(function(err) {
        // This error was just caused by us having to kill the program
        resolve();
      });
  })
  .catch(function(error) {
    console.error(error);
  });
}

