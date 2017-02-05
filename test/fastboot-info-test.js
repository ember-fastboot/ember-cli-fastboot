var expect = require('chai').expect;
var path = require('path');
var FastBootInfo = require('./../src/fastboot-info.js');
var FastBootResponse = require('./../src/fastboot-response.js');
var FastBootRequest = require('./../src/fastboot-request.js');

describe("FastBootInfo", function() {
  var response;
  var request;
  var fastbootInfo;
  var metadata = {
    'foo': 'bar',
    'baz': 'apple'
  };

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

    fastbootInfo = new FastBootInfo(request, response, { metadata });
  });

  it("has a FastBootRequest", function() {
    expect(fastbootInfo.request).to.be.an.instanceOf(FastBootRequest);
  });

  it("has a FastBootResponse", function() {
    expect(fastbootInfo.response).to.be.an.instanceOf(FastBootResponse);
  });


  it("has metadata", function() {
    expect(fastbootInfo.metadata).to.deep.equal(metadata);
  });
});
