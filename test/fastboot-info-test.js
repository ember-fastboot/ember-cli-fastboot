var expect = require('chai').expect;
var path = require('path');
var FastBootInfo = require('../lib/fastboot-info.js');

describe("FastBootInfo", function() {
  it("has a FastBootRequest", function() {
    var response = {};
    var request = {
      cookie: "",
      protocol: "http",
      headers: {
      },
      get: function() {
        return this.cookie;
      }
    };
    var fastbootInfo = new FastBootInfo(request, response);

    expect(fastbootInfo.request.protocol).to.equal("http");
  });
});

