var Contextify = require('contextify');
var Sandbox = require('../sandbox');

function ContextifySandbox(options) {
  this.init(options);
  Contextify(this.sandbox);
}

ContextifySandbox.prototype = Object.create(Sandbox.prototype);
ContextifySandbox.prototype.constructor = Sandbox;

ContextifySandbox.prototype.eval = function(source, filePath) {
  this.sandbox.run(source, filePath);
};

ContextifySandbox.prototype.run = function(cb) {
  var sandbox = this.sandbox;
  return cb.call(sandbox, sandbox);
};

module.exports = ContextifySandbox;
