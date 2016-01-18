var uniq = require('lodash').uniq;

function FastBootConfig(project) {
  var moduleWhitelist = [];

  eachAddonPackage(project, function(pkg) {
    var deps = pkg['ember-addon'] && pkg['ember-addon'].fastBootDependencies;

    if (deps) {
      moduleWhitelist = moduleWhitelist.concat(deps);
    }
  });

  this.moduleWhitelist = uniq(moduleWhitelist);
}

FastBootConfig.prototype.toJSONString = function() {
  return JSON.stringify({
    moduleWhitelist: this.moduleWhitelist
  }, null, 2);
};

function eachAddonPackage(project, cb) {
  project.addons.map(function(addon) {
    cb(addon.pkg);
  });
}

module.exports = FastBootConfig;
