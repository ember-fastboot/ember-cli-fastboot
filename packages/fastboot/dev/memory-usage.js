'use strict';

/**
 * This script is used for gathering basic memory statistics. It takes a heapsnapshot at the following locations:
 *
 * - `new FastBoot({ distPath: '...' })` - Saved in `snapshots/0-setup.heapsnapshot`
 * - `await fastboot.visit('/')` - Saved in `snapshots/1-first-visit.heapsnapshot`
 * - `await fastboot.visit('/')` - Saved in `snapshots/2-second-visit.heapsnapshot`
 * - `await fastboot.visit('/')` - Saved in `snapshots/3-third-visit.heapsnapshot`
 *
 * General usage and evaluation steps:
 *
 * 1. run the script (e.g. `node dev/memory-usage.js`)
 * 2. Navigate Chrome to the `about:blank`
 * 3. Open the Chrome DevTools
 * 4. Click into the "Memory" tab.
 * 5. Click "Load" and load each of the files above (in order)
 * 6. Review / evaluate
 */

/* eslint-disable-next-line node/no-unsupported-features/node-builtins */
const inspector = require('inspector');
const path = require('path');
const fs = require('fs');
const session = new inspector.Session();

session.connect();

let file;
// uses whatever the "current" file is
session.on('HeapProfiler.addHeapSnapshotChunk', m => {
  fs.writeSync(file, m.params.chunk);
});

function takeHeapSnapshot(path) {
  file = fs.openSync(path, 'w');

  return new Promise((resolve, reject) => {
    session.post('HeapProfiler.takeHeapSnapshot', null, (err, r) => {
      fs.closeSync(file);

      if (err) {
        reject(err);
      }

      resolve(r);
    });
  });
}

async function main() {
  fs.mkdirSync('snapshots');

  const FastBoot = require('../src/index');

  const distPath = path.join(__dirname, '../test/fixtures/basic-app');
  const fastboot = new FastBoot({
    distPath,
  });

  await takeHeapSnapshot('snapshots/0-setup.heapsnapshot');

  let result = await fastboot.visit('/');
  await result.html();

  await takeHeapSnapshot('snapshots/1-first-visit.heapsnapshot');

  result = await fastboot.visit('/');
  await result.html();

  await takeHeapSnapshot('snapshots/2-second-visit.heapsnapshot');

  result = await fastboot.visit('/');
  await result.html();

  await takeHeapSnapshot('snapshots/3-third-visit.heapsnapshot');
}

main().finally(() => {
  session.disconnect();
});
