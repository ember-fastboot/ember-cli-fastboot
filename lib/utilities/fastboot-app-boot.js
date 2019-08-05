'use strict'

// Added as app boot code to app.js that allows booting of the application
// in browser. This code is injected during app-boot type of contentFor hook for ember-cli.
module.exports = function fastbootAppBoot(prefix, configAppAsString, isModuleUnification) {
  var appSuffix = isModuleUnification ? "src/main" : "app";
  return [
    "",
    "if (typeof FastBoot === 'undefined') {",
    "  if (typeof runningTests === 'undefined' || !runningTests) {",
    "    require('{{MODULE_PREFIX}}/" + appSuffix + "')['default'].create({{CONFIG_APP}});",
    "  }",
    "}",
    ""
  ].join("\n").replace(/\{\{MODULE_PREFIX\}\}/g, prefix).replace(/\{\{CONFIG_APP\}\}/g, configAppAsString);
};
