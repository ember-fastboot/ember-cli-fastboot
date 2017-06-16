'use strict';

const path = require('path');
const existsSync = require('exists-sync');
const fs = require('fs-extra');

const fastbootInitializerTypes = [ 'initializers', 'instance-initializers'];
const FASTBOOT_DIR = 'fastboot';

/**
 * Helper function to check if there are any `(instance-)?intializers/[browser|fastboot]/` path under the
 * given root path.
 *
 * @param {String} rootPath
 * @param {String} type
 * @returns {Boolean} true if path exists
 */
function _checkInitializerTypeExists(rootPath, type) {
  const isTypeExists = fastbootInitializerTypes.some((fastbootInitializerType) => {
    const pathType = path.join(rootPath, 'app', fastbootInitializerType, type);

    return existsSync(pathType);
  });

  return isTypeExists;
}
/**
 * Helper function to check if there are any `(instance-)?intializers/browser/` path under the
 * given root path and throw an error
 *
 * @param {String} rootPath
 */
function _checkBrowserInitializers(rootPath) {
  const isBrowserInitializersPresent = _checkInitializerTypeExists(rootPath, 'browser');

  if (isBrowserInitializersPresent) {
    const errorMsg = `FastBoot build no longer supports ${rootPath}/app/(instance-)?initializers/browser structure. ` +
                         `Please refer to http://ember-fastboot.com/docs/addon-author-guide#browser-only-or-node-only-initializers for a migration path.`;
    throw new Error(errorMsg);
  }
}

/**
 * Function to move the fastboot initializers to fastboot/app
 * @param {Object} project
 * @param {String} rootPath
 */
function _moveFastBootInitializers(project, rootPath) {

  // check to see if it is a fastboot complaint addon
  const isFastbootAddon = _checkInitializerTypeExists(rootPath, 'fastboot');
  if (isFastbootAddon) {
    project.ui.writeDeprecateLine(`Having fastboot specific code in app directory of ${rootPath} is deprecated. Please move it to fastboot/app directory.`);

    const fastbootDirPath = path.join(rootPath, FASTBOOT_DIR);
    // check if fastboot/app exists
    if (!existsSync(fastbootDirPath)) {
      fs.mkdirsSync(fastbootDirPath);
    }

    // copy over app/initializers/fastboot and app/instance/initializers/fastboot
    fastbootInitializerTypes.forEach((fastbootInitializerType) => {
      const srcFastbootPath = path.join(rootPath, 'app', fastbootInitializerType, 'fastboot');

      if (existsSync(srcFastbootPath)) {
        const destFastbootPath = path.join(fastbootDirPath, fastbootInitializerType);
        if (!existsSync(destFastbootPath)) {
          fs.mkdirSync(destFastbootPath);
        }

        // fastboot initializer type exists so we need to move this fastboot/app
        const fastbootFiles = fs.readdirSync(srcFastbootPath);
        fastbootFiles.forEach((fastbootFile) => {
          const srcPath = path.join(srcFastbootPath, fastbootFile);
          const destPath = path.join(destFastbootPath, fastbootFile);
          fs.copySync(srcPath, destPath);

          // delete the original path files so that there are no two initializers with the same name
          fs.unlinkSync(srcPath);
        });
      }
    });
  }
}

/**
 * Function that migrates the fastboot initializers for all addons.
 *
 * @param {Object} project
 */
function _migrateAddonInitializers(project) {
  const nodeModulesPath = path.join(project.nodeModulesPath);

  project.addons.forEach((addon) => {
    const currentAddonPath = path.join(nodeModulesPath, addon.name);

    _checkBrowserInitializers(currentAddonPath);
    _moveFastBootInitializers(project, currentAddonPath);
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
  _moveFastBootInitializers(project, hostAppPath);
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