import { Worker } from 'node:worker_threads';

const WORKER_URL = new URL('./worker.js', import.meta.url);

/**
 * Worker threads that each load the app once.
 * A task goes to the worker with the fewest tasks in progress.
 */
export class WorkerPool {
  #workers = [];
  #nextId = 0;
  #workerData;
  #destroyed = false;

  constructor({ size, workerData }) {
    this.#workerData = workerData;

    for (let i = 0; i < size; i++) {
      this.#workers.push(this.#spawn());
    }
  }

  /**
   * Resolves when every worker has loaded the app.
   * Rejects with the error of the first worker that failed to load it.
   */
  ready() {
    return Promise.all(this.#workers.map((entry) => entry.ready));
  }

  async run(task) {
    if (this.#destroyed) {
      throw new Error('This FastBoot instance is destroyed.');
    }

    let entry = this.#workers[0];

    for (let candidate of this.#workers) {
      if (candidate.pending.size < entry.pending.size) entry = candidate;
    }

    await entry.ready;

    let id = this.#nextId++;

    return new Promise((resolve, reject) => {
      entry.pending.set(id, { resolve, reject });
      entry.worker.postMessage({ id, task });
    });
  }

  async destroy() {
    this.#destroyed = true;

    await Promise.all(this.#workers.map((entry) => entry.worker.terminate()));
  }

  #spawn() {
    let worker = new Worker(WORKER_URL, { workerData: this.#workerData });
    let entry = { worker, pending: new Map() };

    entry.ready = new Promise((resolve, reject) => {
      worker.on('message', (message) => {
        if (message.ready) {
          entry.loaded = true;
          resolve();
          return;
        }

        let task = entry.pending.get(message.id);

        entry.pending.delete(message.id);
        task?.resolve(message.result);
      });

      worker.on('error', (error) => {
        reject(error);
        this.#failAll(entry, error);
      });

      worker.on('exit', (code) => {
        this.#failAll(entry, new Error(`A FastBoot worker stopped with exit code ${code}.`));

        /** A worker that never loaded the app fails again, so it is not replaced. */
        if (!this.#destroyed && entry.loaded) {
          let index = this.#workers.indexOf(entry);

          if (index >= 0) this.#workers[index] = this.#spawn();
        }
      });
    });

    /** `ready()` reports the error. A failed worker is not an unhandled rejection. */
    entry.ready.catch(() => {});

    return entry;
  }

  #failAll(entry, error) {
    for (let task of entry.pending.values()) {
      task.reject(error);
    }

    entry.pending.clear();
  }
}
