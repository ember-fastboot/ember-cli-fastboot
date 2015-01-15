module.exports = {
  name: 'fastboot',
  description: 'Runs a server to render your app using FastBoot.',

  availableOptions: [
    { name: "mode", type: String, default: 'slow', alias: ['m'] }
  ],

  anonymousOptions: [
    '<app-js-path>',
    '<vendor-js-path>'
  ],

  //runCommand: function(command, args) {
    //var path    = require('path');
    //var spawn   = require('child_process').spawn;

    //return new Promise(function(resolve, reject) {
      //var child = spawn(command, args);

      //var result = {
        //output: [],
        //errors: [],
        //code: null
      //};

      //child.stdout.on('data', function (data) {
        //var string = data.toString();

        //console.log(string);

        //result.output.push(string);
      //});

      //child.stderr.on('data', function (data) {
        //var string = data.toString();

        //console.error(string);

        //result.errors.push(string);
      //});

      //child.on('close', function (code) {
        //result.code = code;

        //if (code === 0) {
          //resolve(result);
        //} else {
          //reject(result);
        //}
      //});
    //});
  //},

  triggerBuild: function(commandOptions) {
    var BuildTask = this.tasks.Build;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    commandOptions.environment = commandOptions.environment || 'development';
    commandOptions.outputPath = 'dist';
    return buildTask.run(commandOptions);
  },

  runCommand: function(rawArgs) {
    var fs = require('fs');

    var appFile = rawArgs[0];
    var vendorFile = rawArgs[1];

    appFile = fs.readFileSync(appFile);
    vendorFile = fs.readFileSync(vendorFile);

    var sandbox = createSandbox();
    sandbox.sandbox.run(vendorFile.toString() + "\n" + appFile.toString());

    var express = require('express');
    var app = express();

    app.get("/*", function(req, res) {
      sandbox.promise.then(res.send.bind(res));
    });

    var server = app.listen(3000, function() {
      var host = server.address().address;
      var port = server.address().port;

      console.log('Ember FastBoot running at http://%s:%s', host, port);
    });

    var RSVP    = require('rsvp');
    var Promise = RSVP.Promise;


    return new Promise(function() { });
  },

  run: function(options, rawArgs) {
    var self = this;
    //var path = require('path');
    //var command = path.join(__dirname, '..', '..', 'node_modules', 'divshot-cli', 'bin', 'divshot.js');

    return this.triggerBuild(options)
      .then(function() {
        return self.runCommand(rawArgs);
      });
  }
};

function createSandbox() {
  var SimpleDOM = require('simple-dom');
  var Contextify = require('contextify');
  var RSVP    = require('rsvp');

  var deferred = RSVP.defer();

  var sandbox = {
    SimpleDOM: SimpleDOM,
    console: console,
    setTimeout: setTimeout,
    module: { exports: {} },
    FastBoot: { resolve: deferred.resolve }
  };

  sandbox.window = sandbox;

  Contextify(sandbox);

  return { sandbox: sandbox, promise: deferred.promise };
}
