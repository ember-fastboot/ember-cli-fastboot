/* eslint-env node */
'use strict';

const path = require('path');
const fs = require('fs');
const Plugin = require('broccoli-plugin');
const fastbootAppFactoryModule = require('../utilities/fastboot-app-factory-module');

module.exports = class FastBootAppFactory extends Plugin {
  constructor(inputNode, options) {
    super([inputNode], {
      annotation: 'Generate: FastBoot app-factory module',
      persistentOutput: true
    });
    this.appName = options.appName;
    this.isModuleUnification = options.isModuleUnification;
  }

  build() {
    let outputPath = path.join(this.outputPath, 'app-factory.js');
    let content = fastbootAppFactoryModule(this.appName, this.isModuleUnification);
    fs.writeFileSync(outputPath, content);
  }
};