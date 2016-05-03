'use strict';

const chalk = require('chalk');
const debug = require('debug')('fastboot:middleware');

class Server {
  constructor(options) {
    this.ui = options.ui;
  }

  log(statusCode, message, startTime) {
    let color = statusCode === 200 ? 'green' : 'red';
    let now = new Date();

    if (startTime) {
      let diff = Date.now() - startTime;
      message = message + chalk.blue(" " + diff + "ms");
    }

    this.ui.writeLine(chalk.blue(now.toISOString()) + " " + chalk[color](statusCode) + " " + message);
  }

  insertIntoIndexHTML(title, body, head) {
    let html = this.html.replace("<!-- EMBER_CLI_FASTBOOT_BODY -->", body);

    if (title) {
      html = html.replace("<!-- EMBER_CLI_FASTBOOT_TITLE -->", "<title>" + title + "</title>");
    }
    if (head) {
      html = html.replace("<!-- EMBER_CLI_FASTBOOT_HEAD -->", head);
    }

    return html;
  }

  handleSuccess(res, path, result, startTime) {
    let contentFor = result.contentFor;
    let headers = result.headers;

    this.log(result.statusCode, 'OK ' + path, startTime);

    for (var pair of headers.entries()) {
      res.set(pair[0], pair[1]);
    }

    res.status(result.statusCode);
    res.send(this.insertIntoIndexHTML(contentFor.title, contentFor.body, contentFor.head));
  }

  handleFailure(res, path, error, startTime) {
    if (error.name === "UnrecognizedURLError") {
      this.log(404, "Not Found " + path, startTime);
      res.sendStatus(404);
    } else {
      console.log(error.stack);
      this.log(500, "Unknown Error: " + error, startTime);
      res.sendStatus(500);
    }
  }
}

module.exports = function(fastboot) {
  let server = new Server({
    ui: fastboot.ui
  });

  return function(req, res) {
    let app = fastboot._app;
    server.html = fastboot.html;

    let path = req.url;
    debug("middleware request; path=%s", path);

    let startTime = Date.now();

    app.visit(path, { request: req, response: res })
      .then(success, failure)
      .finally(function() {
        debug("finished handling; url=%s", path);
      });

    function success(result) {
      server.handleSuccess(res, path, result, startTime);
    }

    function failure(error) {
      server.handleFailure(res, path, error, startTime);
    }
  };
};

