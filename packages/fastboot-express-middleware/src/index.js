'use strict';


/**
 * Returns a promise when the streaming has ended.
 * Flushes out the incoming data from the shoebox or body content.
 * @param {*} streamer 
 * @param {*} res 
 * @returns 
 */
function promisifiedStream(streamer, res) {
  return new Promise(resolve => {
    streamer.on('data', (data) => {
      const chunk = data.toString();
      res.write(chunk);
      res.flush();
    });
    streamer.on('end', () => {
      resolve(null);
    });
  });
}

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
      resilient: opts.resilient
    });
  }

  return async function(req, res, next) {
    let path = req.url;
    res.writeHead(200,{"Content-Type" : "text/html"});
    // initialize the body streamer
    const streamablebody = fastboot.initStreamer({ request: req, response: res }, path);
    streamablebody.stream();
    // Eager send 200
    // Flush out the head
    res.write(fastboot.headData());
    res.flush();

    // Convert the stream into promise so that we can wait until the whole
    // body + shoebox codelets are streamed.
    await promisifiedStream(streamablebody, res);

    // Flush the footer data.
    res.write(fastboot.footData());
    // End the response.
    res.end();
   };
}

let chalk;

function _log(statusCode, message, startTime) {
  chalk = chalk || require('chalk');
  let color = statusCode === 200 ? 'green' : 'red';
  let now = new Date();

  if (startTime) {
    let diff = Date.now() - startTime;
    message = message + chalk.blue(" " + diff + "ms");
  }

  console.log(chalk.blue(now.toISOString()) + " " + chalk[color](statusCode) + " " + message);
}

module.exports = fastbootExpressMiddleware;
