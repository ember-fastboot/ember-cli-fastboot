'use strict';

var path             = require('path');
var fs               = require('fs-extra');
var existsSync       = require('exists-sync');
var temp             = require('temp').track();
var debug            = require('debug')('fastboot-test');

var Promise          = require('../../lib/ext/promise');
var runCommand       = require('./run-command');
var chdir            = require('./chdir');
var moveDirectory    = require('./move-directory');
var symlinkDirectory = require('./symlink-directory');
var copy             = Promise.denodeify(require('cpr'));
var exec             = Promise.denodeify(require('child_process').exec);

var root             = process.cwd();

// The parent temporary directory (e.g. in /var/tmp/...)
var tmpDir;

// Where pristine versions of projects and dependencies (like node_modules) are
// cached between each test.
var pristinePath;
var pristineNodeModulesPath;
var pristineBowerComponentsPath;

// Where the app being tested is copied to during a test run. Pristine versions of the app
// and dependencies will be copied here in case they need to be modified.
var underTestPath;

// Creates a temp directory outside the project for creating new Ember CLI
// apps in. (New apps cannot be created in the project directory because it is itself
// an Ember app and Ember CLI doesn't like that).
//
// Once created, this function creates two directories:
//
//   - `pristine`
//   - `under-test`
//
// `pristine` is used to store pristine versions of apps, as well as for caching
// `node_modules` and `bower_components` directories. As multiple tests get run,
// the `pristine` directory is used as a cache to avoid expensive operations such
// as `ember new` and `npm install`.
//
// `under-test` is the directory where the app being tested by the current acceptance
// test goes. At the beginning of the test, the app is copied from `pristine` to
// `under-test`.
function ensureTempCreated() {
  if (tmpDir) { return; }

  tmpDir = temp.mkdirSync();
  process.chdir(tmpDir);

  pristinePath = path.join(tmpDir, 'pristine');
  pristineNodeModulesPath = path.join(pristinePath, 'node_modules');
  pristineBowerComponentsPath = path.join(pristinePath, 'bower_components');

  underTestPath = path.join(tmpDir, 'under-test');

  fs.mkdirsSync(pristinePath);
  fs.mkdirsSync(underTestPath);

  debug("created tmp; path=" + tmpDir);

  // To speed up test runs, use the project's `tmp/precooked_node_modules` directory
  // if it exists.
  symlinkPrecookedNodeModules();
}

// If the user has supplied a `tmp/precooked_node_modules` directory, that is symlinked
// into the `pristine` directory before an app is created. That will be used rather than
// having `ember new` do an `npm install`, saving significant time.
function symlinkPrecookedNodeModules() {
  var precookedNodeModulesPath = path.join(root, 'tmp', 'precooked_node_modules');

  // If the user running the tests has provided a "precooked" node_modules directory to be used
  // by an Ember app, we use that as the pristine version instead of running `npm install`. This
  // greatly reduces the time tests take to run.
  if (existsSync(precookedNodeModulesPath)) {
    debug('symlinking precooked node_modules; path=' + precookedNodeModulesPath);
    symlinkDirectory(precookedNodeModulesPath, pristineNodeModulesPath);
  } else {
    debug('no precooked node_modules');
  }
}

function hasPristineNodeModules() {
  return existsSync(pristineNodeModulesPath);
}

function hasPristineBowerComponents() {
  return existsSync(pristineBowerComponentsPath);
}

// Public API for putting an app under test. If the app doesn't
// exist already, it will create it and put it into the `pristine`
// directory, then put a copy into `under-test`. Subsequent calls
// to `createApp()` will use the pristine app as a cache.
function createApp(appName) {
  ensureTempCreated();

  var pristineAppPath = path.join(pristinePath, appName);
  var underTestAppPath = path.join(underTestPath, appName);

  // If this app was already tested, delete the copy.
  // This ensures that any modifications made during testing are
  // reset.
  if (existsSync(underTestAppPath)) {
    fs.removeSync(underTestAppPath);
  }

  // If a pristine version of the app doesn't exist, create it.
  if (!existsSync(pristineAppPath)) {
    return installPristineApp(appName)
      .then(function() {
        copyUnderTestApp(pristineAppPath, underTestAppPath);
      });
  }

  copyUnderTestApp(pristineAppPath, underTestAppPath);
  return Promise.resolve();
}

function copyFixtureFiles(appName) {
  var destDir = path.join(underTestPath, appName);
  var sourceDir = path.join(__dirname, '../', 'fixtures', appName);

  debug("copying fixtures; from=" + sourceDir + "; to=" + destDir);

  return copy(sourceDir, destDir, {
    overwrite: true
  });
}

function copyUnderTestApp(pristineAppPath, underTestAppPath) {
  debug("copying pristine app; from=" + pristineAppPath + "; to=" + underTestAppPath);
  fs.copySync(pristineAppPath, underTestAppPath);
  debug("copying complete");

  chdir(underTestAppPath);
}

function installPristineApp(appName) {
  var hasNodeModules = hasPristineNodeModules();
  var hasBowerComponents = hasPristineBowerComponents();
  var extraOptions = [];

  // First, determine if we can skip installing npm packages
  // or Bower components if we have a pristine set of dependencies
  // already.

  // Fresh install
  if (!hasNodeModules && !hasBowerComponents) {
    debug("no node_modules or bower_components");
  // bower_components but no node_modules
  } else if (!hasNodeModules && hasBowerComponents) {
    debug("no node_modules but existng bower_components");
    extraOptions = ['--skip-bower'];
  // node_modules but no bower_components
  } else if (hasNodeModules && !hasBowerComponents) {
    debug("no bower_components but existng node_modules");
    extraOptions = ['--skip-npm'];
  // Everything is already there
  } else {
    debug("existing node_modules and bower_components");
    extraOptions = ['--skip-npm', '--skip-bower'];
  }

  chdir(pristinePath);

  var promise = applyCommand('new', appName, extraOptions)
    .catch(handleResult)
    .then(function() {
      chdir(path.join(pristinePath, appName));
    });

  // If we installed a fresh node_modules or bower_components directory,
  // grab those as pristine copies we can use in future runs.
  if (!hasNodeModules) {
    promise = promise.then(function() {
        debug('installing ember-disable-prototype-extensions');
        return exec('npm install ember-disable-prototype-extensions');
      })
      .then(function() {
        debug("installed ember-disable-prototype-extension");
      })
      .then(movePristineNodeModules(appName))
      .then(symlinkFastBoot);
  }

  promise = promise.then(addEmberCanaryToBowerJSON(appName));

  if (!hasBowerComponents) {
    promise = promise.then(function() {
      return exec('bower install');
    })
    .then(function() {
      debug("installed ember#canary");
      debug("installed ember-data#canary");
    })
    .then(movePristineBowerComponents(appName));
  }

  return promise.then(addFastBootToPackageJSON(appName))
    .then(linkDependencies(appName))
    .catch(function(err) {
      console.error(err);
    });
}

function movePristineNodeModules(appName) {
  return function() {
    var nodeModulesPath = path.join(pristinePath, appName, 'node_modules');
    moveDirectory(nodeModulesPath, pristineNodeModulesPath);
  };
}

function movePristineBowerComponents(appName) {
  return function() {
    var bowerComponentsPath = path.join(pristinePath, appName, 'bower_components');
    moveDirectory(bowerComponentsPath, pristineBowerComponentsPath);
  };
}

function linkDependencies(appName) {
  return function() {
    var nodeModulesAppPath = path.join(pristinePath, appName, 'node_modules');
    var bowerComponentsAppPath = path.join(pristinePath, appName, 'bower_components');

    symlinkDirectory(pristineNodeModulesPath, nodeModulesAppPath);
    symlinkDirectory(pristineBowerComponentsPath, bowerComponentsAppPath);
  };
}

function addEmberCanaryToBowerJSON(appName) {
  return function() {
    var bowerJSONPath = path.join(pristinePath, appName, 'bower.json');
    var bowerJSON = fs.readJsonSync(bowerJSONPath);

    bowerJSON.resolutions = {
      "ember": "canary",
      "ember-data": "canary"
    };

    bowerJSON.dependencies['ember'] = 'canary';
    bowerJSON.dependencies['ember-data'] = 'canary';

    fs.writeJsonSync(bowerJSONPath, bowerJSON);
  };
}

function symlinkFastBoot() {
  var fastbootPath = path.join(pristineNodeModulesPath, 'ember-cli-fastboot');

  debug("symlinking ember-cli-fastboot");

  if (existsSync(fastbootPath)) {
    var stats = fs.lstatSync(fastbootPath);
    if (stats.isSymbolicLink()) {
      debug("ember-cli-fastboot is already symlinked");
      return;
    }

    fs.removeSync(fastbootPath);
  }

  symlinkDirectory(root+'/', fastbootPath);
}


function addFastBootToPackageJSON(appName) {
  return function() {
    var packageJSONPath = path.join(pristinePath, appName, 'package.json');
    var fastBootPackageJSONPath = path.join(root, 'package.json');

    debug('installing ember-cli-fastboot');

    // Read the current version of the FastBoot addon under test, then add that
    // to the Ember app's package.json.
    var packageJSON = fs.readJsonSync(packageJSONPath);
    var fastbootPackageJSON = fs.readJsonSync(fastBootPackageJSONPath);

    packageJSON.devDependencies['ember-cli-fastboot'] = fastbootPackageJSON.version;

    fs.writeJsonSync('package.json', packageJSON);
  };
}

var runCommandOptions = {
  // Note: We must override the default logOnFailure logging, because we are
  // not inside a test.
  log: function() {
    return; // no output for initial application build
  }
};

function applyCommand(command, name, flags) {
  var args = [path.join(__dirname, '../../node_modules/ember-cli/', 'bin', 'ember'), command, '--disable-analytics', '--watcher=node', '--skip-git', name, runCommandOptions];

  flags.forEach(function(flag) {
    args.splice(2, 0, flag);
  });

  return runCommand.apply(undefined, args);
}

function handleResult(result) {
  debug('handling result');
  if (result.output) { console.log(result.output.join('\n')); }
  if (result.errors) { console.log(result.errors.join('\n')); }
  throw result;
}

module.exports = {
  createApp: createApp,
  copyFixtureFiles: copyFixtureFiles
};
