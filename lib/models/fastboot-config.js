var fmt = require('util').format;
var uniq = require('lodash').uniq;
var path = require('path');

function FastBootConfig(options) {
  this.project = options.project;
  this.ui = options.ui;
  this.outputPaths = options.outputPaths;

  this.buildDependencies();
  this.buildManifest();
}

FastBootConfig.prototype.buildDependencies = function() {
  var dependencies = {};
  var moduleWhitelist = [];
  var ui = this.ui;

  eachAddonPackage(this.project, function(pkg) {
    var deps = getFastBootDependencies(pkg);

    if (deps) {
      deps.forEach(function(dep) {
        var version = getDependencyVersion(pkg, dep);

        if (dep in dependencies) {
          version = dependencies[dep];
          ui.writeLine(fmt("Duplicate FastBoot dependency %s. Versions may mismatch. Using range %s.", dep, version), ui.WARNING);
          return;
        }

        moduleWhitelist.push(dep);

        if (version) {
          dependencies[dep] = version;
        }
      });
    }
  });

  this.dependencies = dependencies;
  this.moduleWhitelist = uniq(moduleWhitelist);
};

FastBootConfig.prototype.buildManifest = function() {
  var outputPaths = this.outputPaths;

  this.manifest = {
    appFile: strip(outputPaths.app.js),
    htmlFile: strip(outputPaths.app.html),
    vendorFile: strip(outputPaths.vendor.js)
  };
};

FastBootConfig.prototype.toJSONString = function() {
  return JSON.stringify({
    dependencies: this.dependencies,
    fastboot: {
      moduleWhitelist: this.moduleWhitelist,
      manifest: this.manifest
    }
  }, null, 2);
};

function eachAddonPackage(project, cb) {
  project.addons.map(function(addon) {
    cb(addon.pkg);
  });
}

function getFastBootDependencies(pkg) {
  return pkg['ember-addon'] && pkg['ember-addon'].fastBootDependencies;
}

function getDependencyVersion(pkg, dep) {
  if (!pkg.dependencies) {
    throw new Error(fmt("Could not find FastBoot dependency '%s' in %s/package.json dependencies.", dep, pkg.name));
  }

  return pkg.dependencies[dep];
}

function strip(filePath) {
  if (filePath.substr(0,1) === path.sep) {
    return filePath.substr(1);
  }

  return filePath;
}

module.exports = FastBootConfig;
