'use strict';

function fastbootExpressMiddleware(distPath, options) {
  let opts = options;

  if (arguments.length === 1) {
    if (typeof distPath === 'string') {
      opts = { distPath: distPath };
    } else {
      opts = distPath;
    }
  }

  opts = opts || {};

  let log = opts.log !== false ? _log : function() {};

  let fastboot = opts.fastboot;

  if (!fastboot) {
    let FastBoot = require('fastboot');
    fastboot = new FastBoot({
      distPath: opts.distPath,
      resilient: opts.resilient,
    });
  }

  return async function(req, res, next) {
    let path = req.url;

    try {
      let visitOptions = Object.assign({}, opts.visitOptions, { request: req, response: res });
      let result = await fastboot.visit(path, visitOptions);
      let body = opts.chunkedResponse ? await result.chunks() : await result.html();

      if (result.error) {
        log('RESILIENT MODE CAUGHT:', result.error.stack);
        next(result.error);
      }

      let headers = result.headers;
      let statusMessage = result.error ? 'NOT OK ' : 'OK ';

      for (var pair of headers.entries()) {
        res.append(pair[0], pair[1]);
      }

      log(result.statusCode, statusMessage + path);
      res.status(result.statusCode);

      if (typeof body === 'string') {
        res.send(body);
      } else if (result.error) {
        res.send(body[0]);
      } else {
        body.forEach(chunk => res.write(chunk));
        res.end();
      }
    } catch (error) {
      if (error.name === 'UnrecognizedURLError') {
        next();
      } else {
        res.status(500);
        next(error);
      }
    }
  };
}

let chalk;

function _log(statusCode, message, startTime) {
  chalk = chalk || require('chalk');
  let color = statusCode === 200 ? 'green' : 'red';
  let now = new Date();

  if (startTime) {
    let diff = Date.now() - startTime;
    message = message + chalk.blue(' ' + diff + 'ms');
  }

  console.log(chalk.blue(now.toISOString()) + ' ' + chalk[color](statusCode) + ' ' + message);
}

module.exports = fastbootExpressMiddleware;
