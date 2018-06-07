'use strict';

const vm = require('vm');
const fs = require('fs');
const Sandbox = require('./../../../src/sandbox');

/**
 * Sandbox class for loading all the assets required to create an app in a Node
 * constraint environment and run the app on the server side. This class extends
 * from fastboot's Sandbox class
 *
 */
class CustomSandbox extends Sandbox {
  constructor(options) {
    super(options);
    vm.createContext(this.sandbox);
  }

  /**
   * Evals the file in the sandbox.
   *
   */
  eval(source, filePath) {
    var fileScript = new vm.Script(source, { filename: filePath });
    fileScript.runInContext(this.sandbox);
  }

  /**
   * Runs a given function in the sandbox with providing the context and the sandbox object.
   * Can be used to run functions outside of the sandbox in the sandbox.
   *
   * @todo: use this when we create app factory from addon
   */
  run(cb) {
    return cb.call(this.sandbox, this.sandbox);
  }

  /**
   * Wraps console.error with sending the error over the channel as well so that
   * it is reported by EKG.
   * // TODO: change this function to send error over the channel instead.
   *
   */
  buildWrappedConsole() {
    var wrappedConsole =  Object.create(console);
    wrappedConsole.error = function() {
      console.error.apply(console, Array.prototype.map.call(arguments, function(a) {
        return a;
      }));
    };

    return wrappedConsole;
  }

}
module.exports = CustomSandbox;
