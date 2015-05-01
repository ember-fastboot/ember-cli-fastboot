var fs = require('fs');
var path = require('path');
var RSVP = require('rsvp');

module.exports = {
  name: "fastboot-by-default",
  description: "Install `ember fastboot` as `npm start`.",

  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },

  install: function(options) {
    var project = options.project;
    var packagePath = path.join(project.root, 'package.json');
    var contents = fs.readFileSync(packagePath, { encoding: 'utf8' });
    var pkg = JSON.parse(contents);

    pkg.scripts.start = 'ember fastboot --serve-assets';

    var newContents = JSON.stringify(pkg, null, 2);
    fs.writeFileSync(packagePath, newContents, { encoding: 'utf8' });

    return RSVP.resolve();
  }
};
