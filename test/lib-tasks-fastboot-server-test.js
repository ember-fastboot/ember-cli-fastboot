'use strict';

const CoreObject = require('core-object');
const camelize = require('ember-cli-string-utils').camelize;
const defaults = require('lodash.defaults');
const EventEmitter = require('events').EventEmitter;
const expect = require('chai').expect;
const FastbootCommand = CoreObject.extend(require('../lib/commands/fastboot')());
const FastbootServerTask = require('../lib/tasks/fastboot-server');
const http = require('http');
const RSVP = require('rsvp');
const sinon = require('sinon');

function CommandOptions(options) {
  const defaultOptions = {};
  new FastbootCommand().availableOptions.forEach(o => {
    defaultOptions[camelize(o.name)] = o.default;
  });
  return defaults(options || {}, defaultOptions);
};
function MockServer() {
  EventEmitter.apply(this, arguments);
  this.listen = (port, host, callback) => {
    RSVP.Promise.resolve().then(function() {
      callback();
    });
  };
  this.address = () => ({ port: 1, host: '0.0.0.0', family: 'IPv4' });
}
MockServer.prototype = Object.create(EventEmitter.prototype);

function MockAddon() {
  this.emitter = EventEmitter.apply(this, arguments);
}

MockAddon.prototype = Object.create(EventEmitter.prototype);

const mockUI = { writeLine() {} };

describe('fastboot server task', function() {
  let options, task;
  let addon = new MockAddon();
  beforeEach(function() {
    this.sinon = sinon.sandbox.create();
    task = new FastbootServerTask({
      ui: mockUI,
      addon: addon
    });
    options = new CommandOptions();
  });

  afterEach(function() {
    this.sinon.restore();
  });

  describe('run', function() {
    it('calls restart on outputReady', function() {
      const restartStub = this.sinon.stub(task, 'outputReady', function() {});
      task.run(options);
      addon.emit('outputReady');
      expect(restartStub.called).to.be.ok;
    });
  });

  describe('restart', function() {
    let fbReloadStub, oldFb;

    beforeEach(function() {
      oldFb = task.fastboot;
      fbReloadStub = this.sinon.stub().returns(RSVP.resolve());
      task.fastboot = {
        reload: fbReloadStub
      };
    });

    afterEach(function() {
      task.fastboot = oldFb;
    });

    it('calls fastboot.reload', function() {
      return task.restart(options)
        .then(() => {
          expect(fbReloadStub.callCount).to.equal(1);
        });
    });
  });

  describe('start', function() {
    let createServerStub, execStub, mockServer, requireSpy, useStub;
    const mockApp = { get() {}, use() {} };
    const mockExpress = () => mockApp;
    const mockExpressStatic = {};
    mockExpress.static = () => mockExpressStatic;
    const mockRequire = (which) => {
      if (which === 'express') { return mockExpress; }
      if (which === 'fastboot-express-middleware') return () => {};
      if (which === 'fastboot') return function fakeBoot() {};
    };

    beforeEach(function() {
      mockServer = new MockServer();
      createServerStub = this.sinon.stub(task.http, 'createServer').returns(mockServer);
      execStub = this.sinon.stub(task, 'exec').returns(RSVP.resolve());
      task.require = mockRequire;
      requireSpy = this.sinon.spy(task, 'require');
      useStub = this.sinon.stub(mockApp, 'use');
    });

    it('uses express.static when serve-assets=true', function() {
      options = new CommandOptions({ serveAssets: true });
      return task.start(options)
        .then(() => {
          expect(useStub.calledWith(mockExpressStatic)).to.equal(true);
        });
    });

    it('tracks open sockets using connection and close events', function() {
      return task.start(options)
        .then(() => {
          expect(Object.keys(task.sockets).length).to.equal(0);
          expect(task.nextSocketId).to.equal(0);
          let socket = new EventEmitter();
          mockServer.emit('connection', socket);
          expect(Object.keys(task.sockets).length).to.equal(1);
          expect(task.sockets[0]).to.equal(socket);
          expect(task.nextSocketId).to.equal(1);
          socket.emit('close');
          expect(Object.keys(task.sockets).length).to.equal(0);
          expect(task.sockets[0]).to.equal(undefined);
          mockServer.emit('connection', socket);
          expect(Object.keys(task.sockets).length).to.equal(1);
          expect(task.sockets[1]).to.equal(socket);
          expect(task.nextSocketId).to.equal(2);
        })
    });
  });

  describe('stop', function() {
    it('is safe to call before start', function() {
      let stopPromise;
      const callStop = () => { stopPromise = task.stop(options); };
      expect(callStop).to.not.throw();
      return stopPromise;
    });

    // Sequence of calls
    // 1. server.close (stop opening sockets and set close callback)
    // 2. sockets[i].destroy
    // 3. close callback
    it('destroys open sockets after calling server.close', function() {
      let closeCallback;
      const destroyPromise = new RSVP.Promise(resolve => { });
      const mockServer = { close(cb) { closeCallback = cb; } };
      const closeSpy = this.sinon.spy(mockServer, 'close');
      const mockSocket = {
        destroy() {
          expect(closeSpy.called).to.equal(true);
          if (closeCallback) closeCallback();
        }
      };
      const destroySpy = this.sinon.spy(mockSocket, 'destroy');
      task.httpServer = mockServer;
      task.sockets[0] = mockSocket;
      task.stop(options)
        .then(() => {
          expect(destroySpy.called).to.equal(true);
          expect(task.httpServer).to.equal(null);
        });
    });
  });
});
