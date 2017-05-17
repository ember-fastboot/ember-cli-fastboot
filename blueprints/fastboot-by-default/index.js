'use strict';

const fs = require('fs');
const path = require('path');
const RSVP = require('rsvp');

module.exports = {
  name: 'fastboot-by-default',
  description: 'Install `ember fastboot` as `npm start`.',

  normalizeEntityName() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  install(options) {
    let project = options.project;
    let packagePath = path.join(project.root, 'package.json');
    let contents = fs.readFileSync(packagePath, { encoding: 'utf8' });
    let pkg = JSON.parse(contents);

    pkg.scripts.start = 'ember fastboot --serve-assets';

    let newContents = JSON.stringify(pkg, null, 2);
    fs.writeFileSync(packagePath, newContents, { encoding: 'utf8' });

    return RSVP.Promise.resolve();
  }
};
