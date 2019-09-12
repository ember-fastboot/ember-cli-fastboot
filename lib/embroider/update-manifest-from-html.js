'use strict';

const fs = require('fs');
const findScriptSrcs = require('find-scripts-srcs-in-document');

// TODO: hard coding these seem unfortunate, especially vendor-static which is non-standard
const FILES_TO_SKIP = /vendor|vendor-static/gi;

module.exports = function updateManifestFromHtml(root) {
  const pkg = JSON.parse(fs.readFileSync(root + '/package.json', 'UTF8'));

  // bail if not embroider (let's chat if this is appropriate);
  if (!('version' in pkg['ember-addon'])) {
    return;
  }

  // otherwise, we must parse the index.html file to figure out what's next
  const indexHtml = fs.readFileSync(root + '/index.html', 'UTF8')
  // TODO: fix simple-html-tokenizer: https://github.com/tildeio/simple-html-tokenizer/pull/71
    .replace('<!DOCTYPE html>','')

  const appFiles = findScriptSrcs(indexHtml, findScriptSrcs.ignoreWithAttribute('data-embroider-ignore'))
    // TODO: these FILES_TO_SKIP things seem over zealous
    .filter( src => !FILES_TO_SKIP.test(src))
    // TODO: handle prefixed / custom origin paths / or files
    .filter(src => fs.existsSync(`${root}/${src}`));

  // TODO: this feels super janky, we need to figure out a better approach
  const fastbootFile = pkg.fastboot.manifest.appFiles.find(x => /-fastboot.js$/.test(x))

  if (!fastbootFile) {
    throw new Error(`ember-cli-fastbot: missing '<app-name>-fastboot.js' file`)
  }

  appFiles.push(fastbootFile);
  pkg.fastboot.manifest.appFiles = appFiles;
  fs.writeFileSync(`${root}/package.json`, JSON.stringify(pkg, null, 2));
};
