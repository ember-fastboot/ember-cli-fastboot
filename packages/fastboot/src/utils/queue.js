'use strict';

const debug = require('debug')('fastboot:ember-app');

/**
 * Utility Queue class to store queue of sandboxes that can be leveraged when using `buildSandboxPerVisit`.
 *
 * @public
 */
class Queue {
  constructor(builderFn, maxSize = 1) {
    this.items = [];
    this.maxSize = maxSize;
    this.builderFn = builderFn;
  }

  _buildItem() {
    return this.builderFn();
  }

  _addToQueue() {
    this.items.push(this._buildItem());
  }

  enqueue() {
    // when the queue is not full, we add the item into the queue, otherwise ignore adding
    // to the queue.
    if (!this.isFull()) {
      this._addToQueue();
    } else {
      debug('Ignoring adding appInstance to queue as Queue is already full!');
    }
  }

  dequeue() {
    if (this.isEmpty()) {
      // build on demand if the queue does not have a pre-warmed version to avoid starving
      // the system
      return { item: this._buildItem(), isItemPreBuilt: false };
    } else {
      // return a pre-warmed version
      return { item: this.items.shift(), isItemPreBuilt: true };
    }
  }

  isEmpty() {
    return this.size() === 0;
  }

  size() {
    return this.items.length;
  }

  isFull() {
    return this.size() === this.maxSize;
  }
}

module.exports = Queue;
