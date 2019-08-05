'use strict';

const fs = require('fs');
const findScriptSrcs = require('find-scripts-srcs-in-document');
const getScriptFileName = require('../utilities/get-script-file-name');

module.exports = function updateManifestFromHtml(root) {
  const pkg = JSON.parse(fs.readFileSync(root + '/package.json', 'UTF8'));
  const htmlFileName = pkg.fastboot.manifest.htmlFile || 'index.html';

  // otherwise, we must parse the index.html file to figure out what's next
  const indexHtml = fs.readFileSync(root + '/' + htmlFileName, 'UTF8')
  // TODO: fix simple-html-tokenizer: https://github.com/tildeio/simple-html-tokenizer/pull/71
    .replace('<!DOCTYPE html>','');

  const assetsDir = `assets/`;
  const vendorFiles = pkg.fastboot.manifest.vendorFiles || [];

  // Find script src which are not data-fastboot-ignore
  const indexScriptFilePaths = findScriptSrcs(indexHtml, findScriptSrcs.ignoreWithAttribute('data-fastboot-ignore'))
  .filter( src => {
    // skipping files if they are part of vendorFiles list
    // this would cover any vendor files (vendor or vendor-static)

    // The App Files list from html in shouldn't include
    // vendor files as they are already included in manifest.
    // Checking if the script file from index.html
    // is in the the list of vendor files in package.json and skip them.
    const fileName = getScriptFileName(src);
    return !vendorFiles.find(filePath => fileName === getScriptFileName(filePath));
  });

  /**
   * Reading app files by parsing index.html so that FastBoot can load assets that
   * are same as what is generategd as part of the build flow and updated in
   * index.html.
   *
   * Example: Embroider build flow upon WebPack as stage 3 processing in the build
   * updates app.js to multiple chunks and updates index.html. Parsing from index.html
   * allows loading same set of app files in FastBoot sandbox.
   *
   */
  const appFiles = new Set();
  indexScriptFilePaths.forEach(src => {
    // Extract the file name from the src file paths and
    // checks the file exits in the assets location on the disk.
    const fileName = getScriptFileName(src);
    const assetPath = `${assetsDir}${fileName}`;
    const filePath = `${root}/${assetPath}`;
    if(fileName && fs.existsSync(filePath)) {
      appFiles.add(assetPath);
    }
  });

  const fastbootFile = pkg.fastboot.manifest.appFiles.find(x => /-fastboot.js$/.test(x));
  appFiles.add(fastbootFile);
  pkg.fastboot.manifest.appFiles = Array.from(appFiles);
  fs.writeFileSync(`${root}/package.json`, JSON.stringify(pkg, null, 2));
};
