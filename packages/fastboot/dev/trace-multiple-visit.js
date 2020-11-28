'use strict';

/**
 * This script is used for quickly tracing the characteristics of the following:
 *
 * - `require('fastboot')` - Labeled in the trace as `"require fastboot"`
 * - `new FastBoot({ distPath: '...' })` - Labeled in the trace as `"initial setup"`
 * - `await fastboot.visit('/')` - Labeled in the trace as `"first visit"`
 * - `await fastboot.visit('/')` - Labeled in the trace as `"second visit"`
 * - `await fastboot.visit('/')` - Labeled in the trace as `"third visit"`
 *
 * General usage and evaluation steps:
 *
 * 1. run the script (e.g. `node dev/trace-multiple-visit.js`)
 * 2. Navigate Chrome to the `chrome:tracing`
 * 3. Click "load" (in the top left) and navigate to this repo, select the `node_trace.1.log` file
 * 4. Review / evaluate
 */
const path = require('path');
const { performance } = require('perf_hooks');

// can also enable these via `node --trace-event-categories`
// enabling here via the JS API to make invocation and testing
// of this script a bit easier
/* eslint-disable node/no-missing-require */
const trace_events = require('trace_events');
const tracing = trace_events.createTracing({
  categories: ['v8', 'node.perf', 'node.console', 'node.vm.script'],
});

async function main() {
  tracing.enable();

  performance.mark('require fastboot start');
  const FastBoot = require('../src/index');
  performance.mark('require fastboot end');
  performance.measure('require fastboot', 'require fastboot start', 'require fastboot end');

  const distPath = path.join(__dirname, '../test/fixtures/basic-app');
  performance.mark('setup start');
  const fastboot = new FastBoot({
    distPath,
  });
  performance.mark('setup end');
  performance.measure('initial setup', 'setup start', 'setup end');

  performance.mark('visit start');
  let result = await fastboot.visit('/');
  await result.html();
  performance.mark('visit end');
  performance.measure('first visit', 'visit start', 'visit end');

  performance.mark('visit start');
  result = await fastboot.visit('/');
  await result.html();
  performance.mark('visit end');
  performance.measure('second visit', 'visit start', 'visit end');

  performance.mark('visit start');
  result = await fastboot.visit('/');
  await result.html();
  performance.mark('visit end');
  performance.measure('third visit', 'visit start', 'visit end');
}

main();
