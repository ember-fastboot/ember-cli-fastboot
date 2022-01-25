'use strict';

const path = require('path');
const fs = require('fs-extra');
const SilentError = require('silent-error');
const existsSync = fs.existsSync;

const fastbootInitializerTypes = ['initializers', 'instance-initializers'];

/**
 * Helper function to check if there are any `(instance-)?intializers/[browser|fastboot]/` path under the
 * given root path.
 *
 * @param {String} rootPath
 * @param {String} type
 * @returns {Boolean} true if path exists
 */
function _checkInitializerTypeExists(rootPath, type) {
  const isTypeExists = fastbootInitializerTypes.some(
    (fastbootInitializerType) => {
      const pathType = path.join(
        rootPath,
        'app',
        fastbootInitializerType,
        type
      );

      return existsSync(pathType);
    }
  );

  return isTypeExists;
}
/**
 * Helper function to check if there are any `(instance-)?intializers/browser/` path under the
 * given root path and throw an error
 *
 * @param {String} rootPath
 */
function _checkBrowserInitializers(rootPath) {
  const isBrowserInitializersPresent = _checkInitializerTypeExists(
    rootPath,
    'browser'
  );

  if (isBrowserInitializersPresent) {
    const errorMsg =
      `FastBoot build no longer supports ${rootPath}/app/(instance-)?initializers/browser structure. ` +
      `Please refer to http://ember-fastboot.com/docs/addon-author-guide#browser-only-or-node-only-initializers for a migration path.`;
    throw new SilentError(errorMsg);
  }
}

/**
 * Function to move the fastboot initializers to fastboot/app
 * @param {Object} project
 * @param {String} rootPath
 */
function _checkFastBootInitializers(project, rootPath) {
  // check to see if it is a fastboot complaint addon
  const isFastbootAddon = _checkInitializerTypeExists(rootPath, 'fastboot');
  if (isFastbootAddon) {
    throw new SilentError(
      `Having fastboot specific code in app directory of ${rootPath} is deprecated. Please move it to fastboot/app directory.`
    );
  }
}

/**
 * Function that migrates the fastboot initializers for all addons.
 *
 * @param {Object} project
 */
function _migrateAddonInitializers(project) {
  project.addons.forEach((addon) => {
    const currentAddonPath = addon.root;

    _checkBrowserInitializers(currentAddonPath);
    _checkFastBootInitializers(project, currentAddonPath);
  });
}

/**
 * Function to migrate fastboot initializers for host app.
 *
 * @param {Object} project
 */
function _migrateHostAppInitializers(project) {
  const hostAppPath = path.join(project.root);

  _checkBrowserInitializers(hostAppPath);
  _checkFastBootInitializers(project, hostAppPath);
}

/**
 * Function that migrates all addons and host app fastboot initializers to fastboot/app.
 * It also throws an error if any addon or host app has browser forked initializers.
 *
 * @param {Object} project
 */
module.exports = function migrateInitializers(project) {
  _migrateAddonInitializers(project);
  _migrateHostAppInitializers(project);
};
