var fs     = require('fs');
var fmt    = require('util').format;
var uniq   = require('lodash.uniq');
var path   = require('path');
var Plugin = require('broccoli-plugin');

function FastBootConfig(inputNode, options) {
  Plugin.call(this, [inputNode], {
    annotation: "Generate: FastBoot package.json"
  });

  this.project = options.project;
  this.name = options.name;
  this.ui = options.ui;
  this.fastbootAppConfig = options.fastbootAppConfig;
  this.outputPaths = options.outputPaths;
}

FastBootConfig.prototype = Object.create(Plugin.prototype);
FastBootConfig.prototype.constructor = FastBootConfig;

/**
 * The main hook called by Broccoli Plugin. Used to build or
 * rebuild the tree. In this case, we generate the configuration
 * and write it to `package.json`.
 */
FastBootConfig.prototype.build = function() {
  this.buildDependencies();
  this.buildManifest();
  this.buildHostWhitelist();

  var outputPath = path.join(this.outputPath, 'package.json');
  fs.writeFileSync(outputPath, this.toJSONString());
};

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

  var pkg = this.project.pkg;
  var projectDeps = pkg.fastbootDependencies;

  if (projectDeps) {
    projectDeps.forEach(function(dep) {
      moduleWhitelist.push(dep);

      var version = pkg.dependencies && pkg.dependencies[dep];
      if (version) {
        dependencies[dep] = version;
      }
    });
  }

  this.dependencies = dependencies;
  this.moduleWhitelist = uniq(moduleWhitelist);
};

FastBootConfig.prototype.readAssetManifest = function() {
  var assetMapPath = path.join(this.inputPaths[0], 'fastbootAssetMap.json');

  try {
    var assetMap = JSON.parse(fs.readFileSync(assetMapPath));
    fs.unlinkSync(assetMapPath);
    return assetMap;
  } catch (e) {
    // No asset map was found, proceed as usual
  }
};

FastBootConfig.prototype.buildManifest = function() {
  var appFileName = path.basename(this.outputPaths.app.js).split('.')[0];
  var appFile = 'fastboot/' + appFileName + '.js';
  var vendorFileName = path.basename(this.outputPaths.vendor.js).split('.')[0];
  var vendorFile = 'fastboot/' + vendorFileName + '.js';

  var manifest = {
    appFile: appFile,
    vendorFile: vendorFile,
    htmlFile: 'index.html'
  };

  var rewrittenAssets = this.readAssetManifest();

  if (rewrittenAssets) {
    ['appFile', 'vendorFile'].forEach(function(file) {
      manifest[file] = rewrittenAssets.assets[manifest[file]];
    });
  }

  this.manifest = manifest;
};

FastBootConfig.prototype.buildHostWhitelist = function() {
  if (!!this.fastbootAppConfig) {
    this.hostWhitelist = this.fastbootAppConfig.hostWhitelist;
  }
};

FastBootConfig.prototype.toJSONString = function() {
  return JSON.stringify({
    dependencies: this.dependencies,
    fastboot: {
      moduleWhitelist: this.moduleWhitelist,
      manifest: this.manifest,
      hostWhitelist: this.normalizeHostWhitelist()
    }
  }, null, 2);
};

FastBootConfig.prototype.normalizeHostWhitelist = function() {
  if (!this.hostWhitelist) {
    return;
  }

  return this.hostWhitelist.map(function(entry) {
    // Is a regex
    if (entry.source) {
      return '/' + entry.source + '/';
    } else {
      return entry;
    }
  });
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

module.exports = FastBootConfig;
