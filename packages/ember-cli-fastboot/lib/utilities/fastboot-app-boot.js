/* eslint-disable prettier/prettier */
'use strict'

// Added as app boot code to app.js that allows booting of the application
// in browser. This code is injected during app-boot type of contentFor hook for ember-cli.
module.exports = function fastbootAppBoot(prefix, configAppAsString) {
  var appSuffix = "app";
  return [
    "",
    "if (typeof FastBoot === 'undefined') {",
    "  if (!runningTests) {",
    "    require('{{MODULE_PREFIX}}/" + appSuffix + "')['default'].create({{CONFIG_APP}});",
    "  }",
    "}",
    ""
  ].join("\n").replace(/\{\{MODULE_PREFIX\}\}/g, prefix).replace(/\{\{CONFIG_APP\}\}/g, configAppAsString);
};
