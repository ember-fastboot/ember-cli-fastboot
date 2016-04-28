var expect = require('chai').expect;
var path = require('path');
var FastBootInfo = require('../lib/fastboot-info.js');
var FastBootResponse = require('../lib/fastboot-response.js');
var FastBootRequest = require('../lib/fastboot-request.js');

describe("FastBootInfo", function() {
  var response;
  var request;
  var fastbootInfo;

  beforeEach(function () {
    response = {};
    request = {
      cookie: "",
      protocol: "http",
      headers: {
      },
      get: function() {
        return this.cookie;
      }
    };

    fastbootInfo = new FastBootInfo(request, response);
  });

  it("has a FastBootRequest", function() {
    expect(fastbootInfo.request).to.be.an.instanceOf(FastBootRequest);
  });

  it("has a FastBootResponse", function() {
    expect(fastbootInfo.response).to.be.an.instanceOf(FastBootResponse);
  });
});

