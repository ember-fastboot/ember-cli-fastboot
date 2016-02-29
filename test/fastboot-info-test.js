var expect = require('chai').expect;
var path = require('path');
var FastBootInfo = require('../lib/fastboot-info.js');

describe("FastBootInfo", function() {
  it("throws an exception if no hostWhitelist is provided", function() {
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
    var fastBootInfo = new FastBootInfo(request, response);

    var fn = function() {
      fastBootInfo.host();
    };
    expect(fn).to.throw(/You must provide a hostWhitelist to retrieve the host/);
  });

  it("throws an exception if the host header does not match an entry in the hostWhitelist", function() {
    var response = {};
    var request = {
      cookie: "",
      protocol: "http",
      headers: {
        host: "evil.com"
      },
      get: function() {
        return this.cookie;
      }
    };
    var hostWhitelist = ["example.com", "localhost:4200"]
    var fastBootInfo = new FastBootInfo(request, response, hostWhitelist);

    var fn = function() {
      fastBootInfo.host();
    };
    expect(fn).to.throw(/The host header did not match a hostWhitelist entry/);
  });

  it("returns the host with protocol if it is in the hostWhitelist", function() {
    var response = {};
    var request = {
      cookie: "",
      protocol: "http",
      headers: {
        host: "localhost:4200"
      },
      get: function() {
        return this.cookie;
      }
    };
    var hostWhitelist = ["example.com", "localhost:4200"]
    var fastBootInfo = new FastBootInfo(request, response, hostWhitelist);

    var host =  fastBootInfo.host();
    expect(host).to.equal("http://localhost:4200");
  });

  it("returns the host with protocol matches a regex in the hostWhitelist", function() {
    var response = {};
    var request = {
      cookie: "",
      protocol: "http",
      headers: {
        host: "localhost:4200"
      },
      get: function() {
        return this.cookie;
      }
    };
    var hostWhitelist = ["example.com", "/localhost:\\d+/"]
    var fastBootInfo = new FastBootInfo(request, response, hostWhitelist);

    var host =  fastBootInfo.host();
    expect(host).to.equal("http://localhost:4200");
  });
});

