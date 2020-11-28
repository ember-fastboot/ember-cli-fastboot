var expect = require('chai').expect;
var FastBootRequest = require('./../src/fastboot-request.js');

describe('FastBootRequest', function() {
  it('throws an exception if no hostWhitelist is provided', function() {
    var request = {
      protocol: 'http',
      headers: {
        cookie: '',
      },
    };
    var fastbootRequest = new FastBootRequest(request);

    var fn = function() {
      fastbootRequest.host();
    };
    expect(fn).to.throw(/You must provide a hostWhitelist to retrieve the host/);
  });

  it('throws an exception if the host header does not match an entry in the hostWhitelist', function() {
    var request = {
      protocol: 'http',
      headers: {
        host: 'evil.com',
        cookie: '',
      },
    };
    var hostWhitelist = ['example.com', 'localhost:4200'];
    var fastbootRequest = new FastBootRequest(request, hostWhitelist);

    var fn = function() {
      fastbootRequest.host();
    };
    expect(fn).to.throw(
      /The host header did not match a hostWhitelist entry. Host header: evil.com/
    );
  });

  it('returns the host if it is in the hostWhitelist', function() {
    var request = {
      protocol: 'http',
      headers: {
        host: 'localhost:4200',
        cookie: '',
      },
    };
    var hostWhitelist = ['example.com', 'localhost:4200'];
    var fastbootRequest = new FastBootRequest(request, hostWhitelist);

    var host = fastbootRequest.host();
    expect(host).to.equal('localhost:4200');
  });

  it('returns the host if it matches a regex in the hostWhitelist', function() {
    var request = {
      protocol: 'http',
      headers: {
        host: 'localhost:4200',
        cookie: '',
      },
    };
    var hostWhitelist = ['example.com', '/localhost:\\d+/'];
    var fastbootRequest = new FastBootRequest(request, hostWhitelist);

    var host = fastbootRequest.host();
    expect(host).to.equal('localhost:4200');
  });

  it('captures the query params from the request', function() {
    var request = {
      protocol: 'http',
      query: {
        foo: 'bar',
      },
      headers: {
        cookie: '',
      },
    };
    var fastbootRequest = new FastBootRequest(request);

    expect(fastbootRequest.queryParams.foo).to.equal('bar');
  });

  it('captures the path from the request', function() {
    var request = {
      protocol: 'http',
      url: '/foo',
      headers: {
        cookie: '',
      },
    };
    var fastbootRequest = new FastBootRequest(request);

    expect(fastbootRequest.path).to.equal('/foo');
  });

  it('captures the headers from the request', function() {
    var request = {
      protocol: 'http',
      url: '/foo',
      headers: {
        host: 'localhost:4200',
        cookie: '',
      },
    };
    var fastbootRequest = new FastBootRequest(request);

    expect(fastbootRequest.headers.get('Host')).to.equal('localhost:4200');
  });

  it('captures the protocol from the request', function() {
    var request = {
      protocol: 'http',
      url: '/foo',
      headers: {
        host: 'localhost:4200',
        cookie: '',
      },
    };
    var fastbootRequest = new FastBootRequest(request);

    expect(fastbootRequest.protocol).to.equal('http:');
  });

  it('captures the cookies from the request', function() {
    var request = {
      protocol: 'http',
      url: '/foo',
      headers: {
        host: 'localhost:4200',
        cookie: 'test=bar',
      },
    };
    var fastbootRequest = new FastBootRequest(request);

    expect(fastbootRequest.cookies.test).to.equal('bar');
  });

  it('captures the method from the request', function() {
    var request = {
      protocol: 'http',
      url: '/foo',
      headers: {
        host: 'localhost:4200',
        cookie: '',
      },
      method: 'GET',
    };
    var fastbootRequest = new FastBootRequest(request);

    expect(fastbootRequest.method).to.equal('GET');
  });

  it('captures the body from the request', function() {
    var request = {
      protocol: 'http',
      url: '/foo',
      headers: {
        host: 'localhost:4200',
        cookie: '',
      },
      body: 'TEST',
    };
    var fastbootRequest = new FastBootRequest(request);

    expect(fastbootRequest.body).to.equal('TEST');
  });
});
