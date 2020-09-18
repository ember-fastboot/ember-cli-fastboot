'use strict';

const blueprintHelpers = require('ember-cli-blueprint-test-helpers/helpers');

const { emberGenerate, emberNew, setupTestHooks } = blueprintHelpers;

const MockUI = require('console-ui/mock');

const expect = require('ember-cli-blueprint-test-helpers/chai').expect;

describe.only('Acceptance: ember generate and destroy default-blueprint', function() {
  setupTestHooks(this);

  it('default-blueprint foo', async function() {
    let args = ['ember-cli-fastboot'];

    // process.stdout.on('data', function(data) {
    //   console.log('face', data.toString());
    //   process.stdin.writeLine('y');
    //   // process.stdout.write(data);
    // });



    // pass any additional command line options in the arguments array
    await emberNew();

    // let ui = new MockUI();

    // let interval = setInterval(() => {
    //   ui.inputStream.write('y\n\r');
    // }, 2000);

    const ember = await emberGenerate(args);

    setTimeout(() => {
      ember.inputStream.write('y\n');
    }, 4000)

    // clearInterval(interval);

    // expect(file('config/targets.js')).to.contain(`node: 'current'`);
  });
});
