'use strict';

const denodeify      = require('denodeify');
const chalk          = require('chalk');
const childProcess   = require('child_process');
const spawn          = childProcess.spawn;
const defaults       = require('lodash/defaults');
const killCliProcess = require('./kill-cli-process');
const debug          = require('./debug');
const logOnFailure   = require('./log-on-failure');
const exec           = denodeify(childProcess.exec);

const isWindows = process.platform === 'win32';

module.exports = function run() {
  let command = arguments[0];
  let args = Array.prototype.slice.call(arguments, 1);
  let options = {};

  if (typeof args[args.length - 1] === 'object') {
    options = args.pop();
  }

  debug(`running command=${command} args=${args}`);

  if (isWindows && (command === 'npm' || command === 'bower')) {
    return exec(command + ' ' + args.join(' '));
  }

  options = defaults(options, {

    onOutput(string) {
      options.log(string);
    },

    onError(string) {
      options.log(chalk.red(string));
    },

    log(string) {
      debug(string);

      logOnFailure(string);
    }
  });

  return new Promise((resolve, reject) => {
    let opts = {};
    if (isWindows) {
      args = ['"' + command + '"'].concat(args);
      command = 'node';
      opts.windowsVerbatimArguments = true;
      opts.stdio = [null, null, null, 'ipc'];
    }
    let child = spawn(command, args, opts);
    let result = {
      output: [],
      errors: [],
      code: null
    };

    if (options.onChildSpawned) {
      let onChildSpawnedPromise = new Promise((childSpawnedResolve, childSpawnedReject) => {
        try {
          options.onChildSpawned(child).then(childSpawnedResolve, childSpawnedReject);
        } catch (err) {
          childSpawnedReject(err);
        }
      });
      onChildSpawnedPromise
        .then(() => {
          if (options.killAfterChildSpawnedPromiseResolution) {
            killCliProcess(child);
          }
        }, err => {
          result.testingError = err;
          if (options.killAfterChildSpawnedPromiseResolution) {
            killCliProcess(child);
          }
        });
    }

    child.stdout.on('data', data => {
      let string = data.toString();

      options.onOutput(string, child);

      result.output.push(string);
    });

    child.stderr.on('data', data => {
      let string = data.toString();

      options.onError(string, child);

      result.errors.push(string);
    });

    child.on('close', (code, signal) => {
      result.code = code;
      result.signal = signal;

      if (code === 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  });
};
