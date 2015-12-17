var log = require('broccoli-stew').log;
var debug = require('broccoli-stew').debug;
var map = require('broccoli-stew').map;
var vm = require('vm');

function patchEmberApp(emberApp) {
  var originalConcatFiles = emberApp.concatFiles;

  emberApp.concatFiles = function(tree, options) {
    if (options.annotation === 'Concat: Vendor') {
      tree = map(tree, '**/*.js', wrap);
    }

    return originalConcatFiles.call(this, tree, options);
  };
}

function wrap(content, path) {
  path = escape(path);

  var validJS = true;

  // Detect if someone put invalid JavaScript in a .js file
  try {
    vm.runInNewContext(content);
  } catch(e) {
    if (e instanceof SyntaxError) {
      validJS = false;
    }
  }

  if (!validJS) { return content; }

  return "\ntry {\n" +
        content +
    "\n} catch (error) { \n " +
    " console.log(error, 'Error evaluating " + path + "');\n}\n";
}

function escape(path) {
  return path.replace(/'/, "\\'");
}

module.exports = patchEmberApp;
