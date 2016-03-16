var path = require('path');
var fs = require('fs');
var defaults = require('lodash/object/defaults');

module.exports = {
  name: 'fastboot:build',
  description: 'Build your assets for FastBoot.',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'output-path', type: String, default: 'fastboot-dist' }
  ],

  run: function(options, args) {
    var BrowserBuildTask = this.tasks.Build;
    var FastBootBuildTask = require('../tasks/fastboot-build');

    var browserBuildTask = new BrowserBuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    var fastbootBuildTask = new FastBootBuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    var outputPath = options.outputPath;
    var browserOutputPath = path.join(outputPath, 'browser');

    var browserOptions = defaults({
      outputPath: browserOutputPath
    }, options);

    return fastbootBuildTask.run(options)
      .then(function() {
        return browserBuildTask.run(browserOptions);
      })
      .then(rewriteAssets(outputPath, browserOutputPath));
  },
};

function rewriteAssets(outputPath, browserOutputPath) {
  return function() {
    var browserAssetMap = JSON.parse(fs.readFileSync(path.join(browserOutputPath, '/assets/assetMap.json')));
    var fastbootAssetMap = JSON.parse(fs.readFileSync(path.join(outputPath, '/assets/assetMap.json')));
    var prepend = browserAssetMap.prepend;

    var indexHTMLPath = path.join(outputPath, 'index.html');
    var indexHTML = fs.readFileSync(indexHTMLPath).toString();
    var newAssets = browserAssetMap.assets;
    var oldAssets = fastbootAssetMap.assets;

    for (var key in oldAssets) {
      var value = oldAssets[key];
      indexHTML = indexHTML.replace(prepend + value, prepend + newAssets[key]);
    }

    fs.writeFileSync(indexHTMLPath, indexHTML);
  };
}
