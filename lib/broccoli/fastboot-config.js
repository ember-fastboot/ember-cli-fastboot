var fs     = require('fs');
var fmt    = require('util').format;
var uniq   = require('lodash.uniq');
var md5Hex = require('md5-hex');
var path   = require('path');
var Plugin = require('broccoli-plugin');

var LATEST_SCHEMA_VERSION = 2;

function FastBootConfig(inputNode, options) {
  Plugin.call(this, [inputNode], {
    annotation: "Generate: FastBoot package.json"
  });

  this.project = options.project;
  // what if app does not set generateAssetMap option? fastboot will be broken otherwise
  var defaultAssetMapPath = 'assets/assetMap.json';
  var assetRev = this.project.addons.filter(function(addon) {
    return addon.name === 'broccoli-asset-rev';
  })[0];

  if (assetRev && assetRev.options) {
    this.assetMapEnabled = !!(assetRev.options.enabled && assetRev.options.generateAssetMap);

    if (assetRev.options.assetMapPath) {
      this.assetMapPath = assetRev.options.assetMapPath;
    }

    if (assetRev.options.fingerprintAssetMap) {
      defaultAssetMapPath = 'assets/assetMap-*.json'
    }
  }

  this.assetMapPath = this.assetMapPath || options.assetMapPath || defaultAssetMapPath;

  this.name = options.name;
  this.assetMapEnabled = options.assetMapEnabled;
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

  if (previous !== next || !fs.existsSync(outputPath)) {
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
  var assetMapPath = path.join(this.inputPaths[0], this.assetMapPath);
  var assetMapEnabled = this.assetMapEnabled;

  try {
    var assetMap = JSON.parse(fs.readFileSync(assetMapPath));
    return assetMap;
  } catch (e) {
    if (this.assetMapEnabled) {
      ui.writeLine(fmt("assetMap.json not found at: %s", assetMapPath), ui.WARNING);
    }
  }
};

FastBootConfig.prototype.updateFastBootManifest = function(manifest) {
  this.project.addons.forEach(function(addon) {
    if (addon.updateFastBootManifest) {
      manifest = addon.updateFastBootManifest(manifest);

      if (!manifest) {
        throw new Error(`${addon.name} did not return the updated manifest from updateFastBootManifest hook.`);
      }
    }
  });

  return manifest;
}

FastBootConfig.prototype.buildManifest = function() {
  var appFilePath = 'assets/' + path.basename(this.outputPaths.app.js);
  var appFileName = appFilePath.split('.')[0];
  var appFastbootFilePath = appFileName + '-fastboot.js';
  var vendorFilePath = 'assets/' + path.basename(this.outputPaths.vendor.js);

  var manifest = {
    appFiles: [appFilePath, appFastbootFilePath],
    vendorFiles: [vendorFilePath],
    htmlFile: this.htmlFile
  };

  manifest = this.updateFastBootManifest(manifest);

  var rewrittenAssets = this.readAssetManifest();

  if (rewrittenAssets) {
    // update the vendor file with the fingerprinted file
    var rewrittenVendorFiles = [];
    manifest['vendorFiles'].forEach(function(file) {
      rewrittenVendorFiles.push(rewrittenAssets.assets[file]);
    });
    manifest['vendorFiles'] = rewrittenVendorFiles;

    // update the app files array with fingerprinted files
    var rewrittenAppFiles = [];
    manifest['appFiles'].forEach(function(file) {
      rewrittenAppFiles.push(rewrittenAssets.assets[file]);
    });
    manifest['appFiles'] = rewrittenAppFiles;

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
      schemaVersion: LATEST_SCHEMA_VERSION,
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
