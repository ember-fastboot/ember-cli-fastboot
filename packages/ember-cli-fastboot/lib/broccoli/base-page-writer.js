'use strict';

const Filter = require('broccoli-persistent-filter');
const merge = require('ember-cli-lodash-subset').merge;
const { JSDOM } = require('jsdom');

module.exports = class BasePageWriter extends Filter {
  constructor(inputNodes, { project, appConfig, outputPaths }) {
    super(inputNodes, {
      annotation: 'FastBoot HTML Writer',
      extensions: ['html'],
      targetExtension: 'html',
    });
    let appName = (this._appName = appConfig.modulePrefix);
    this._project = project;
    this._rootURL = getRootURL(appConfig);
    this._fastbootConfig = {
      [appName]: appConfig,
    };
    this._appJsPath = outputPaths.app.js;
    this._vendorJsPath = outputPaths.vendor.js;
    this._expectedFiles = expectedFiles(this._appJsPath, this._vendorJsPath);
    if (appConfig.fastboot && appConfig.fastboot.htmlFile) {
      this._htmlFile = appConfig.fastboot.htmlFile;
    } else {
      this._htmlFile = 'index.html';
    }
  }

  getDestFilePath() {
    let filteredRelativePath = super.getDestFilePath(...arguments);

    return filteredRelativePath === this._htmlFile
      ? filteredRelativePath
      : null;
  }

  processString(content) {
    let dom = new JSDOM(content);
    this._prepareConfig();
    this._handleConfig(dom);
    this._handleScripts(dom);
    return dom.serialize();
  }

  _prepareConfig() {
    this._fastbootConfig = {
      [this._appName]: this._fastbootConfig[this._appName],
    };
    // we only walk the host app's addons to grab the config since ideally
    // addons that have dependency on other addons would never define
    // this advance hook.
    this._project.addons.forEach((addon) => {
      if (addon.fastbootConfigTree) {
        let configFromAddon = addon.fastbootConfigTree();

        if (!configFromAddon) {
          throw new Error('`fastbootConfigTree` requires a map to be returned');
        }

        merge(this._fastbootConfig, configFromAddon);
      }
    });
  }

  _buildManifest() {
    const updateFastBootManifest = (_manifest) => {
      this._project.addons.forEach((addon) => {
        if (addon.updateFastBootManifest) {
          _manifest = addon.updateFastBootManifest(_manifest);

          if (!_manifest) {
            throw new Error(
              `${addon.name} did not return the updated manifest from updateFastBootManifest hook.`
            );
          }
        }
      });

      return _manifest;
    };

    let appFilePath = stripLeadingSlash(this._appJsPath);
    let appFastbootFilePath = appFilePath.replace(/\.js$/, '') + '-fastboot.js';
    let vendorFilePath = stripLeadingSlash(this._vendorJsPath);

    return updateFastBootManifest({
      appFiles: [appFilePath, appFastbootFilePath],
      vendorFiles: [vendorFilePath],
      htmlFile: this._htmlFile,
    });
  }

  _handleConfig(dom) {
    function findFistConfigMeta(dom) {
      let metaTags = dom.window.document.querySelectorAll('meta');
      for (let element of metaTags) {
        let name = element.getAttribute('name');
        if (name && name.endsWith('/config/environment')) {
          return element;
        }
      }
    }
    let firstConfigMeta;
    if (firstConfigMeta) {
      firstConfigMeta = findFistConfigMeta(dom);
    } else {
      firstConfigMeta = dom.window.document.createTextNode('\n');
      dom.window.document.head.appendChild(firstConfigMeta);
    }
    let nodeRange = new NodeRange(firstConfigMeta);
    for (let [name, options] of Object.entries(this._fastbootConfig)) {
      nodeRange.insertJsonAsMetaTag(
        `${name}/config/fastboot-environment`,
        options
      );
    }
  }

  _handleScripts(dom) {
    let scriptTags = dom.window.document.querySelectorAll('script');

    this._ignoreUnexpectedScripts(scriptTags);

    let fastbootScripts = this._findFastbootScriptToInsert(scriptTags);
    let appJsTag = findAppJsTag(scriptTags, this._appJsPath);
    if (!appJsTag) {
      throw new Error(
        'ember-cli-fastboot cannot find own app script tag, please check your html file'
      );
    }

    insertFastbootScriptsBeforeAppJsTags(fastbootScripts, appJsTag);
  }

  _findFastbootScriptToInsert(scriptTags) {
    let rootURL = this._rootURL;
    let scriptSrcs = [];
    for (let element of scriptTags) {
      scriptSrcs.push(urlWithin(element.getAttribute('src'), rootURL));
    }

    let manifest = this._buildManifest();
    return manifest.vendorFiles
      .concat(manifest.appFiles)
      .map((src) => urlWithin(src, rootURL))
      .filter((src) => !scriptSrcs.includes(src));
  }

  _ignoreUnexpectedScripts(scriptTags) {
    let expectedFiles = this._expectedFiles;
    let rootURL = this._rootURL;
    for (let element of scriptTags) {
      if (
        !expectedFiles.includes(urlWithin(element.getAttribute('src'), rootURL))
      ) {
        element.setAttribute('data-fastboot-ignore', '');
      }
    }
  }
};

function expectedFiles(appJsPath, vendorJsPath) {
  let appFilePath = stripLeadingSlash(appJsPath);
  let appFastbootFilePath = appFilePath.replace(/\.js$/, '') + '-fastboot.js';
  let vendorFilePath = stripLeadingSlash(vendorJsPath);
  return [appFilePath, appFastbootFilePath, vendorFilePath];
}

function getRootURL(appConfig) {
  let rootURL = appConfig.rootURL || '/';
  if (!rootURL.endsWith('/')) {
    rootURL = rootURL + '/';
  }
  return rootURL;
}

function urlWithin(candidate, root) {
  // this is a null or relative path
  if (!candidate || !candidate.startsWith('/')) {
    return candidate;
  }
  let candidateURL = new URL(candidate, 'http://_the_current_origin_');
  let rootURL = new URL(root, 'http://_the_current_origin_');
  if (candidateURL.href.startsWith(rootURL.href)) {
    return candidateURL.href.slice(rootURL.href.length);
  }
}

function findAppJsTag(scriptTags, appJsPath) {
  appJsPath = stripLeadingSlash(appJsPath);
  for (let e of scriptTags) {
    let src = e.getAttribute('src');
    if (src.includes(appJsPath)) {
      return e;
    }
  }
}

function insertFastbootScriptsBeforeAppJsTags(fastbootScripts, appJsTag) {
  let range = new NodeRange(appJsTag);

  for (let src of fastbootScripts) {
    range.insertAsScriptTag(src);
  }
}

class NodeRange {
  constructor(initial) {
    this.start = initial.ownerDocument.createTextNode('');
    initial.parentElement.insertBefore(this.start, initial);
    this.end = initial;
  }

  insertAsScriptTag(src) {
    let newTag = this.end.ownerDocument.createElement('fastboot-script');
    newTag.setAttribute('src', src);
    this.insertNode(newTag);
    this.insertNewLine();
  }

  insertJsonAsMetaTag(name, content) {
    let newTag = this.end.ownerDocument.createElement('meta');
    newTag.setAttribute('name', name);
    newTag.setAttribute('content', encodeURIComponent(JSON.stringify(content)));
    this.insertNode(newTag);
    this.insertNewLine();
  }

  insertNewLine() {
    this.insertNode(this.end.ownerDocument.createTextNode('\n'));
  }

  insertNode(node) {
    this.end.parentElement.insertBefore(node, this.end);
  }
}

function stripLeadingSlash(filePath) {
  return filePath.replace(/^\//, '');
}
