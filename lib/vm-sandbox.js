var vm = require('vm');
var Sandbox = require('./sandbox');

function VMSandbox(options) {
  this.init(options);
  vm.createContext(this.sandbox);
}

VMSandbox.prototype = Object.create(Sandbox.prototype);
VMSandbox.prototype.constructor = Sandbox;

VMSandbox.prototype.eval = function(source, filePath) {
  var fileScript = new vm.Script(source, { filename: filePath });
  fileScript.runInContext(this.sandbox);
};

VMSandbox.prototype.run = function(cb) {
  return cb.call(this.sandbox, this.sandbox);
};

module.exports = VMSandbox;
