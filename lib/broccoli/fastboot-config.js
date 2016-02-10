var fs     = require('fs');
var fmt    = require('util').format;
var uniq   = require('lodash').uniq;
var path   = require('path');
var Plugin = require('broccoli-plugin');

function FastBootConfig(inputNode, options) {
  Plugin.call(this, [inputNode], {
    annotation: "Generate: FastBoot package.json"
  });

  this.project = options.project;
  this.ui = options.ui;
  this.outputPaths = options.outputPaths;
  this.assetMapPath = options.assetMapPath || 'assets/assetMap.json';
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

  this.dependencies = dependencies;
  this.moduleWhitelist = uniq(moduleWhitelist);
};

FastBootConfig.prototype.readAssetManifest = function() {
  var assetMapPath = path.join(this.inputPaths[0], this.assetMapPath);

  try {
    var assetMap = JSON.parse(fs.readFileSync(assetMapPath));
    return assetMap;
  } catch () {
    // No asset map was found, proceed as usual
  }
};

FastBootConfig.prototype.buildManifest = function() {
  var outputPaths = this.outputPaths;

  var manifest = {
    appFile: strip(outputPaths.app.js),
    htmlFile: strip(outputPaths.app.html),
    vendorFile: strip(outputPaths.vendor.js)
  };

  var rewrittenAssets = this.readAssetManifest();

  if (rewrittenAssets) {
    ['appFile', 'vendorFile'].forEach(function(file) {
      manifest[file] = rewrittenAssets.assets[manifest[file]];
    });
  }

  this.manifest = manifest;
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
