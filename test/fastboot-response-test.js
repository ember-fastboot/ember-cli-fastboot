var expect = require('chai').expect;
var path = require('path');
var FastBootHeaders = require('../lib/fastboot-headers.js');
var FastBootResponse = require('../lib/fastboot-response.js');

describe("FastBootResponse", function() {
  var fastBootResponse;

  beforeEach(function () {
    var mockResponse = {
      _headers: {
        "i-am-a": "mock header, me too",
        "cookie": ""
      }
    };

    fastBootResponse = new FastBootResponse(mockResponse);
  });

  describe("headers", function () {
    it("should have headers", function () {
      expect(fastBootResponse).to.have.ownProperty("headers");
    });

    it("should be an instance of FastBootHeaders", function () {
      expect(fastBootResponse.headers).to.be.an.instanceOf(FastBootHeaders);
    });

    it("should contain the original response's headers", function () {
      var header = fastBootResponse.headers.getAll("i-am-a");
      expect(header).to.deep.equal(["mock header", "me too"]);
    });
  });

  describe("statusCode", function () {
    it("should have a statusCode", function () {
      expect(fastBootResponse).to.have.ownProperty("statusCode");
    });

    it("should default to 200", function () {
      expect(fastBootResponse.statusCode).to.equal(200);
    });
  });
});
