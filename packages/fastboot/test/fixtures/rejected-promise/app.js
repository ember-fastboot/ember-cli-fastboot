/**
 * Promise.prototype.finally
 *
 * Pulled from https://github.com/domenic/promises-unwrapping/issues/18#issuecomment-57801572
 * @author @stefanpenner, @matthew-andrews
 */

(function() {
	// Get a handle on the global object
	var local;
	if (typeof global !== 'undefined') local = global;
	else if (typeof window !== 'undefined' && window.document) local = window;
	else local = self;

	// It's replaced unconditionally to preserve the expected behavior
	// in programs even if there's ever a native finally.
	local.Promise.prototype['finally'] = function finallyPolyfill(callback) {
		var constructor = this.constructor;

		return this.then(function(value) {
				return constructor.resolve(callback()).then(function() {
					return value;
				});
			}, function(reason) {
				return constructor.resolve(callback()).then(function() {
					throw reason;
				});
			});
	};
}());

var App = function App() {
};

App.prototype.boot = function() {
  return Promise.resolve(this);
};

App.prototype.visit = function() {
  return Promise.reject(this);
};

App.prototype.buildInstance = function() {
  return Promise.resolve(this);
};

App.prototype.register = function() {
};

App.prototype.inject = function() {
};

App.prototype.destroy = function() {
};

App.prototype.getURL = function() {
};

App.prototype.lookup = function() {
  return {};
};

var modules = {
  '~fastboot/app-factory': {
    'default': function() { return new App(); }
  }
};

var require = function(name) {
  return modules[name];
};
