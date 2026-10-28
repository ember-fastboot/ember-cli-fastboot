import { parentPort, workerData } from 'node:worker_threads';

import { installBrowser } from './browser.js';
import { loadApp } from './load.js';
import { render } from './render.js';

/**
 * One worker thread holds one window and one app for its lifetime.
 * Each render gets a new application instance.
 *
 * Renders in a worker run one after the other,
 * because they share the document.
 */
const { build, options } = workerData;

const window = installBrowser();
const loaded = await loadApp(build, window);

/**
 * An error outside of a render, for example in a timer, does not stop the worker.
 * The renders of the other requests go on.
 */
process.on('uncaughtException', (error) => console.error('[fastboot] Uncaught error:', error));
process.on('unhandledRejection', (error) => console.error('[fastboot] Unhandled rejection:', error));

let queue = Promise.resolve();

parentPort.on('message', ({ id, task }) => {
  queue = queue.then(async () => {
    let result = await render({ ...loaded, window, task, options });

    parentPort.postMessage({ id, result });
  });
});

parentPort.postMessage({ ready: true });
