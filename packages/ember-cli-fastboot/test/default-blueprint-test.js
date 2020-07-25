'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');
const setupTestHooks = blueprintHelpers.setupTestHooks;
const emberNew = blueprintHelpers.emberNew;
const emberGenerateDestroy = blueprintHelpers.emberGenerateDestroy;

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe('Acceptance: ember generate and destroy default-blueprint', function() {
  setupTestHooks(this);

  it('default-blueprint foo', async function() {
    let args = ['ember-cli-fastboot'];

    // pass any additional command line options in the arguments array
    await emberNew();

    const file = await emberGenerateDestroy(args);

    expect(file('config/targets.js')).to.contain(`node: 'current'`);
  });
});
