/**
 * Fix nested packages not using workspace version
 * ember-cli-addon-tests will link ember-cli-fastboot and run npm install in the test apps,
 * the installation will install fastboot from npm registry rather than workspace version
 */

import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packagesDir = path.resolve(__dirname, '../../packages');
const nodeModulesDir = path.resolve(__dirname, 'node_modules');

// eslint-disable-next-line no-undef
const shouldRestore = process.argv[2];
if (shouldRestore === '--help' || shouldRestore === '-h') {
  console.log(`Usage: node fix-node-modules.mjs [arguments]
Options:
    -h, --help     print this message
    -r, --restore  restore node_modules by removing symlinks`);
} else if (shouldRestore === '-r' || shouldRestore === '--restore') {
  run(true);
} else {
  run(false);
}

function run(shouldRestore) {
  ['fastboot', 'fastboot-express-middleware'].forEach((packageName) => {
    const nodeModulesPackageDir = path.join(nodeModulesDir, packageName);
    const workspacesPackageDir = path.resolve(packagesDir, packageName);
    if (fs.existsSync(nodeModulesPackageDir)) {
      console.log(chalk.blue(`remove ${nodeModulesPackageDir}`));
      fs.removeSync(nodeModulesPackageDir);
    }
    if (!shouldRestore) {
      console.log(
        chalk.green(
          `symlink ${nodeModulesPackageDir} -> ${workspacesPackageDir}`
        )
      );
      fs.symlinkSync(workspacesPackageDir, nodeModulesPackageDir, 'dir');
    }
  });
}
