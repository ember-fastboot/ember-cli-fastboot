var bodyParser = require('body-parser');
var FastBootExpressMiddleware = require('fastboot-express-middleware');

module.exports = {
  name: 'post-middleware',

  serverMiddleware(options) {
    var app = options.app;
    app.use(bodyParser.text());
    app.use(function(req, resp, next) {
      var outputPath = req.headers['x-broccoli']['outputPath']

      var fastbootMiddleware = FastBootExpressMiddleware({
        distPath: outputPath
      });

      fastbootMiddleware(req, resp, next);
    });
  }
};
