"use strict";

const expect            = require('chai').expect;
const FastBootAppServer = require('../lib/fastboot-app-server');
const request           = require('request-promise').defaults({ simple: false, resolveWithFullResponse: true });

describe("FastBootAppServer", function() {
  this.timeout(3000);

  it("throws if no distPath or downloader is provided", function() {
    expect(() => {
      new FastBootAppServer();
    }).to.throw(/must be provided with either a distPath or a downloader/);
  });

  it("throws if both a distPath and downloader are provided", function() {
    expect(() => {
      new FastBootAppServer({
        downloader: {},
        distPath: 'some/dist/path'
      });
    }).to.throw(/FastBootAppServer must be provided with either a distPath or a downloader option, but not both/);
  });

  it("serves an HTTP 500 response if the app can't be found", function() {
    let server = new FastBootAppServer({
      workerCount: 1,
      downloader: {
        download() {
          return Promise.resolve();
        }
      }
    });

    return server.start()
      .then(() => request('http://localhost:3000'))
      .then(response => {
        expect(response.statusCode).to.equal(500);
        expect(response.body).to.match(/No Application Found/);
      });
  });

});
