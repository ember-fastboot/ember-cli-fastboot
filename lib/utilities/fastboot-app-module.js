'use strict';

// Expose the an factory for the creating the `Application` object
// with the proper config at a known path, so that the server does
// not have to disover the app's module prefix ("my-app").
//
// The module defined here is prefixed with a `~` to make it less
// likely to collide with user code, since it is not possible to
// define a module with a name like this in the file system.
module.exports = function fastbootAppModule(prefix, moduleToRequire, configAppAsString) {
  return [
    "",
    "if (typeof FastBoot === 'undefined') {",
    "  if (!runningTests) {",
    "    require('{{MODULE_PREFIX}}/{{MODULE}}')['default'].create({{CONFIG_APP}});",
    "  }",
    "}",
    "",
    "define('~fastboot/app-factory', ['{{MODULE_PREFIX}}/{{MODULE}}', '{{MODULE_PREFIX}}/config/environment'], function(App, config) {",
    "  App = App['default'];",
    "  config = config['default'];",
    "",
    "  return {",
    "    'default': function() {",
    "      return App.create(config.APP);",
    "    }",
    "  };",
    "});",
    ""
  ].join("\n").replace(/\{\{MODULE_PREFIX\}\}/g, prefix).replace(/\{\{MODULE\}\}/g, moduleToRequire).replace(/\{\{CONFIG_APP\}\}/g, configAppAsString);
};
