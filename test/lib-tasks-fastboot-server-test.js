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
      const restartStub = this.sinon.stub(task, 'restart');
      task.run(options);
      addon.emit('outputReady');
      expect(restartStub.called).to.be.ok;
    });
  });

  describe('restart', function() {
    let restartSpy, stopStub, clearRequireCacheStub, startStub;

    beforeEach(function() {
      restartSpy = this.sinon.spy(task, 'restart');
      stopStub = this.sinon.stub(task, 'stop').returns(RSVP.resolve());
      clearRequireCacheStub = this.sinon.stub(task, 'clearRequireCache');
      startStub = this.sinon.stub(task, 'start');
    });

    it('calls stop, clearRequireCache, and start', function() {
      return task.restart(options).then(() => {
        expect(restartSpy.callCount).to.equal(1);
        expect(stopStub.callCount).to.equal(1);
        expect(clearRequireCacheStub.callCount).to.equal(1);
        expect(startStub.callCount).to.equal(1);
      });
    });

    it('can restart multiple times', function() {
      const restartPromise = task.restart(options);
      return restartPromise
        .then(() => task.restart(options))
        .then(() => {
          expect(restartSpy.callCount).to.equal(2);
          expect(stopStub.callCount).to.equal(2);
          expect(clearRequireCacheStub.callCount).to.equal(2);
          expect(startStub.callCount).to.equal(2);
        });
    });

    // when outputReady while server is starting
    // (e.g. app file change during server npm install)
    // - wait on start, then reload
    // when outputReady multiple times during startup
    // (e.g. fast app build, slow server npm install)
    // - call reload only once
    it('restarts again just once for all calls during startup', function() {
      const restartPromise = task.restart(options);
      expect(task.restartPromise).to.equal(restartPromise);
      expect(task.restartAgain).to.equal(false);
      task.restart(options);
      task.restart(options);
      expect(task.restartPromise).to.equal(restartPromise);
      expect(task.restartAgain).to.equal(true);
      return restartPromise
        .then(() => {
          expect(task.restartPromise).to.not.equal(restartPromise);
          expect(task.restartAgain).to.equal(false);
          return task.restartPromise;
        })
        .then(() => {
          expect(task.restartPromise).to.equal(null);
          expect(task.restartAgain).to.equal(false);
          expect(restartSpy.callCount).to.equal(4);
          expect(stopStub.callCount).to.equal(2);
          expect(clearRequireCacheStub.callCount).to.equal(2);
          expect(startStub.callCount).to.equal(2);
        });
    });

    it('can restart again after immediate restart completes', function() {
      const restartPromise = task.restart(options);
      expect(task.restartPromise).to.equal(restartPromise);
      expect(task.restartAgain).to.equal(false);
      task.restart(options);
      task.restart(options);
      expect(task.restartPromise).to.equal(restartPromise);
      expect(task.restartAgain).to.equal(true);
      return restartPromise
        .then(() => {
          expect(task.restartPromise).to.not.equal(restartPromise);
          expect(task.restartAgain).to.equal(false);
          return task.restartPromise;
        })
        .then(() => {
          expect(task.restartPromise).to.equal(null);
          expect(task.restartAgain).to.equal(false);
          return task.restart(options);
        })
        .then(() => {
          expect(task.restartPromise).to.equal(null);
          expect(task.restartAgain).to.equal(false);
          expect(restartSpy.callCount).to.equal(5);
          expect(stopStub.callCount).to.equal(3);
          expect(clearRequireCacheStub.callCount).to.equal(3);
          expect(startStub.callCount).to.equal(3);
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
    };

    beforeEach(function() {
      mockServer = new MockServer();
      createServerStub = this.sinon.stub(task.http, 'createServer').returns(mockServer);
      execStub = this.sinon.stub(task, 'exec').returns(RSVP.resolve());
      task.require = mockRequire;
      requireSpy = this.sinon.spy(task, 'require');
      useStub = this.sinon.stub(mockApp, 'use');
    });

    it('runs npm install in server root', function() {
      return task.start(options)
        .then(() => {
          expect(execStub.calledWith('npm install', { cwd: 'dist' })).to.equal(true);
        });
    });

    it('requires server dependencies', function() {
      return task.start(options)
        .then(() => {
          expect(requireSpy.calledWith('fastboot-express-middleware')).to.equal(true);
          expect(requireSpy.calledWith('express')).to.equal(true);
        });
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
