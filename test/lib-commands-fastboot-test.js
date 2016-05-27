'use strict';

const http = require('http');
const CoreObject = require('core-object');
const RSVP = require('rsvp');
const expect = require('chai').expect;
const FastbootCommand = CoreObject.extend(require('../lib/commands/fastboot'));
const camelize = require('ember-cli-string-utils').camelize;
const defaults = require('lodash.defaults');

function CommandOptions(options) {
  const defaultOptions = {};
  new FastbootCommand().availableOptions.forEach(o => {
    defaultOptions[camelize(o.name)] = o.default;
  });
  return defaults(options || {}, defaultOptions);
};

describe('fastboot command', function() {
  describe('build task calls', function() {
    let command, buildRunCalled, buildWatchRunCalled;

    beforeEach(function() {
      buildRunCalled = buildWatchRunCalled = false;
      command = new FastbootCommand({
        blockForever: RSVP.resolve,
        checkPort: RSVP.resolve,
        runServer: RSVP.resolve,
        tasks: {
          Build: CoreObject.extend({ run() { buildRunCalled = true; } }),
          BuildWatch: CoreObject.extend({ run() { buildWatchRunCalled = true; } }),
        },
      });
    });

    it('runs BuildWatch task when build=true and watch=true', function() {
      const options = new CommandOptions({ build: true, watch: true });
      return command.run(options).then(() => {
        expect(buildRunCalled).to.equal(false);
        expect(buildWatchRunCalled).to.equal(true);
      });
    });

    it('runs Build task when build=true and watch=false', function() {
      const options = new CommandOptions({ build: true, watch: false });
      return command.run(options).then(() => {
        expect(buildRunCalled).to.equal(true);
        expect(buildWatchRunCalled).to.equal(false);
      });
    });

    it('runs no build task when build=false', function() {
      const options = new CommandOptions({ build: false });
      return command.run(options).then(() => {
        expect(buildRunCalled).to.equal(false);
        expect(buildWatchRunCalled).to.equal(false);
      });
    });
  });

  describe('port check', function() {
    let command, isCalled;

    beforeEach(function() {
      isCalled = false;
      command = new FastbootCommand({
        blockForever: RSVP.resolve,
        getPort: () => RSVP.resolve(1),
        runBuild: RSVP.resolve,
        ServerTask: CoreObject.extend({ run() { isCalled = true; } }),
      });
    });

    it('runs server task on an available port when port=0', function() {
      const options = new CommandOptions({ port: 0 });
      return command.run(options).then(() => {
        expect(isCalled).to.equal(true);
      });
    });

    it('runs server task if port is available (getPort returns same)', function() {
      const options = new CommandOptions({ port: 1 });
      return command.run(options).then(() => {
        expect(isCalled).to.equal(true);
      });
    });

    it('does not run server task if port is in use (getPort returns other)', function() {
      const options = new CommandOptions({ port: 2 });
      return command.run(options).then(() => {
        expect(false).to.be.ok;
      }).catch(function(error) {
        expect(error.name).to.equal('SilentError');
        expect(error.message).to.equal('Port 1 is already in use.');
        expect(isCalled).to.equal(false);
      }).catch;
    });
  });
});
