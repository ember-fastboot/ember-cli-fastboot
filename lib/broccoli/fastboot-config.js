var fs     = require('fs');
var fmt    = require('util').format;
var uniq   = require('lodash.uniq');
var md5Hex = require('md5-hex');
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
  this.appConfig = options.appConfig;
  this._fileToChecksumMap = {};

  if (this.fastbootAppConfig && this.fastbootAppConfig.htmlFile) {
    this.htmlFile = this.fastbootAppConfig.htmlFile;
  } else {
    this.htmlFile = 'index.html';
  }
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
  this.writeFileIfContentChanged(outputPath, this.toJSONString());
};

FastBootConfig.prototype.writeFileIfContentChanged = function(outputPath, content) {
  var previous = this._fileToChecksumMap[outputPath];
  var next = md5Hex(content);

  if (previous !== next) {
    fs.writeFileSync(outputPath, content);
    this._fileToChecksumMap[outputPath] = next; // update map
  }
};

FastBootConfig.prototype.buildDependencies = function() {
  var dependencies = {};
  var moduleWhitelist = [];
  var ui = this.ui;

  eachAddonPackage(this.project, function(pkg) {
    var deps = getFastBootDependencies(pkg, ui);

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
  var ui = this.ui;
  var assetMapPath = path.join(this.inputPaths[0], 'fastbootAssetMap.json');
  var assetMapEnabled = this.assetMapEnabled;

  try {
    var assetMap = JSON.parse(fs.readFileSync(assetMapPath));
    return assetMap;
  } catch (e) {
    if (this.assetMapEnabled) {
      ui.writeLine(fmt("fastbootAssetMap.json not found at: %s", assetMapPath), ui.WARNING);
    }
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
    htmlFile: this.htmlFile
  };

  var rewrittenAssets = this.readAssetManifest();

  if (rewrittenAssets) {
    var assets = {};

    // Because the assetMap was written before the files in the
    // `asset` folder were moved to the `fastboot` folder,
    // we have to rewrite them here.
    for (var key in rewrittenAssets.assets) {
      var rewrittenKey = assetToFastboot(key);
      assets[rewrittenKey] = assetToFastboot(rewrittenAssets.assets[key]);
    }

    ['appFile', 'vendorFile'].forEach(function(file) {
      // Update package.json with the fingerprinted file.
      manifest[file] = assets[manifest[file]];
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
      hostWhitelist: this.normalizeHostWhitelist(),
      appConfig: this.appConfig
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

function getFastBootDependencies(pkg, ui) {
  var addon = pkg['ember-addon'];
  if (!addon) {
    return addon;
  }

  var deps = addon.fastBootDependencies;
  if (deps) {
    ui.writeDeprecateLine('ember-addon.fastBootDependencies has been replaced with ember-addon.fastbootDependencies [addon: ' + pkg.name + ']');
    return deps;
  }

  return addon.fastbootDependencies;
}

function getDependencyVersion(pkg, dep) {
  if (!pkg.dependencies) {
    throw new Error(fmt("Could not find FastBoot dependency '%s' in %s/package.json dependencies.", dep, pkg.name));
  }

  return pkg.dependencies[dep];
}

module.exports = FastBootConfig;

function assetToFastboot(key) {
  var parts = key.split('/');
  var dir = parts[0];
  if (dir === 'assets') {
    parts[0] = 'fastboot';
  }
  return parts.join('/');
}
