'use strict';

var vm = require('vm');
var Sandbox = require('./sandbox');

class VMSandbox extends Sandbox {
  constructor(options) {
    super(options);
    vm.createContext(this.sandbox);
  }

  eval(source, filePath) {
    var fileScript = new vm.Script(source, { filename: filePath });
    fileScript.runInContext(this.sandbox);
  }

  run(cb) {
    return cb.call(this.sandbox, this.sandbox);
  }

}

module.exports = VMSandbox;
