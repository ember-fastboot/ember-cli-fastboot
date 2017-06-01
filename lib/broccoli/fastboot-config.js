'use strict';

const fs     = require('fs');
const fmt    = require('util').format;
const uniq   = require('lodash.uniq');
const md5Hex = require('md5-hex');
const path   = require('path');
const Plugin = require('broccoli-plugin');

const stringify = require('json-stable-stringify');

const LATEST_SCHEMA_VERSION = 2;

module.exports = class FastBootConfig extends Plugin {
  constructor(inputNode, options) {
    super([inputNode], {
      annotation: 'Generate: FastBoot package.json',
      persistentOutput: true
    });

    this.project = options.project;
    // what if app does not set generateAssetMap option? fastboot will be broken otherwise
    let defaultAssetMapPath = 'assets/assetMap.json';
    let assetRev = this.project.addons.find(addon => addon.name === 'broccoli-asset-rev');

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


  /**
   * The main hook called by Broccoli Plugin. Used to build or
   * rebuild the tree. In this case, we generate the configuration
   * and write it to `package.json`.
   */
  build() {
    this.buildDependencies();
    this.buildManifest();
    this.buildHostWhitelist();

    let outputPath = path.join(this.outputPath, 'package.json');
    this.writeFileIfContentChanged(outputPath, this.toJSONString());
  }

  writeFileIfContentChanged(outputPath, content) {
    let previous = this._fileToChecksumMap[outputPath];
    let next = md5Hex(content);

    if (previous !== next) {
      fs.writeFileSync(outputPath, content);
      this._fileToChecksumMap[outputPath] = next; // update map
    }
  }

  buildDependencies() {
    let dependencies = {};
    let moduleWhitelist = [];
    let ui = this.ui;

    eachAddonPackage(this.project, pkg => {
      let deps = getFastBootDependencies(pkg, ui);

      if (deps) {
        deps.forEach(dep => {
          let version = getDependencyVersion(pkg, dep);

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

    let pkg = this.project.pkg;
    let projectDeps = pkg.fastbootDependencies;

    if (projectDeps) {
      projectDeps.forEach(dep => {
        moduleWhitelist.push(dep);

        let version = pkg.dependencies && pkg.dependencies[dep];
        if (version) {
          dependencies[dep] = version;
        }
      });
    }

    this.dependencies = dependencies;
    this.moduleWhitelist = uniq(moduleWhitelist);
  };

  readAssetManifest() {
    let ui = this.ui;
    let assetMapPath = path.join(this.inputPaths[0], this.assetMapPath);
    let assetMapEnabled = this.assetMapEnabled;

    try {
      let assetMap = JSON.parse(fs.readFileSync(assetMapPath));
      return assetMap;
    } catch (e) {
      if (this.assetMapEnabled) {
        ui.writeLine(fmt("assetMap.json not found at: %s", assetMapPath), ui.WARNING);
      }
    }
  }

  updateFastBootManifest(manifest) {
    this.project.addons.forEach(addon =>{
      if (addon.updateFastBootManifest) {
        manifest = addon.updateFastBootManifest(manifest);

        if (!manifest) {
          throw new Error(`${addon.name} did not return the updated manifest from updateFastBootManifest hook.`);
        }
      }
    });

    return manifest;
  }

  buildManifest() {
    let appFilePath = 'assets/' + path.basename(this.outputPaths.app.js);
    let appFileName = appFilePath.split('.')[0];
    let appFastbootFilePath = appFileName + '-fastboot.js';
    let vendorFilePath = 'assets/' + path.basename(this.outputPaths.vendor.js);

    let manifest = {
      appFiles: [appFilePath, appFastbootFilePath],
      vendorFiles: [vendorFilePath],
      htmlFile: this.htmlFile
    };

    manifest = this.updateFastBootManifest(manifest);

    let rewrittenAssets = this.readAssetManifest();

    if (rewrittenAssets) {
      // update the vendor file with the fingerprinted file
      let rewrittenVendorFiles = manifest['vendorFiles'].map(file => rewrittenAssets.assets[file]);
      manifest['vendorFiles'] = rewrittenVendorFiles;

      // update the app files array with fingerprinted files
      let rewrittenAppFiles = manifest['appFiles'].map(file => rewrittenAssets.assets[file]);
      manifest['appFiles'] = rewrittenAppFiles;

    }

    this.manifest = manifest;
  }

  buildHostWhitelist() {
    if (!!this.fastbootAppConfig) {
      this.hostWhitelist = this.fastbootAppConfig.hostWhitelist;
    }
  };

  toJSONString() {
    return stringify({
      dependencies: this.dependencies,
      fastboot: {
        moduleWhitelist: this.moduleWhitelist,
        schemaVersion: LATEST_SCHEMA_VERSION,
        manifest: this.manifest,
        hostWhitelist: this.normalizeHostWhitelist(),
        appConfig: this.appConfig
      }
    }, null, 2);
  }

  normalizeHostWhitelist() {
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
  }
}

function eachAddonPackage(project, cb) {
  project.addons.map(addon => cb(addon.pkg));
}

function getFastBootDependencies(pkg, ui) {
  let addon = pkg['ember-addon'];
  if (!addon) {
    return addon;
  }

  let deps = addon.fastBootDependencies;
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

function assetToFastboot(key) {
  let parts = key.split('/');
  let dir = parts[0];
  if (dir === 'assets') {
    parts[0] = 'fastboot';
  }
  return parts.join('/');
}
