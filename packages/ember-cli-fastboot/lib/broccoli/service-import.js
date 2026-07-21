const Filter = require('broccoli-persistent-filter');

module.exports = class ServiceImportReplacer extends Filter {
  constructor(inputNode, search, replace, options = {}) {
    super(inputNode, {
      annotation: options.annotation,
    });
    this.extensions = ['js'];
    this.targetExtension = 'js';
  }
  processString(content) {
    return content.replace(
      `import { service } from '@ember/service';`,
      `import { inject as service } from '@ember/service';`,
    );
  }
};
