var bodyParser = require('body-parser');
var FastBootExpressMiddleware = require('fastboot-express-middleware');
var FastBoot = require('fastboot');

module.exports = {
  name: 'post-middleware',

  serverMiddleware: function(options) {
    var app = options.app;
    app.use(bodyParser.json());
    app.use(function(req, resp, next) {
      var broccoliHeader = req.headers['x-broccoli'];
      var outputPath = broccoliHeader['outputPath'];

      if (req.method === 'POST') {
        if (!this.fastboot) {
          this.fastboot = new FastBoot({
            distPath: outputPath
          });
        }

        var fastbootMiddleware = FastBootExpressMiddleware({
          fastboot: this.fastboot
        });

        fastbootMiddleware(req, resp, next);
      } else {
        next();
      }
    });
  }
};
