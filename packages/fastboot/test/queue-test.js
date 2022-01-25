'use strict';

const expect = require('chai').expect;
const Queue = require('../src/utils/queue');

describe('Queue', function () {
  const builderFn = () => {
    return 'Foo';
  };

  it('creates a queue when maxSize is not provided', function () {
    const queue = new Queue(builderFn);

    expect(queue.maxSize).to.equals(1);
  });

  it('creates a queue and can enqueue items', function () {
    const queue = new Queue(builderFn, 3);

    queue.enqueue();
    queue.enqueue();
    queue.enqueue();

    expect(queue.isEmpty()).to.be.false;
  });

  it('does not add items when queue is full', function () {
    const queue = new Queue(builderFn, 3);

    queue.enqueue();
    queue.enqueue();
    queue.enqueue();
    queue.enqueue();
    queue.enqueue();

    expect(queue.size()).to.equals(3);
  });

  it('can dequeue if item is in queue', function () {
    const queue = new Queue(builderFn, 3);

    queue.enqueue();
    queue.enqueue();
    queue.enqueue();

    expect(queue.dequeue()).to.deep.equals({ item: 'Foo', isItemPreBuilt: true });
  });

  it('builds item on demand when there is no item to dequeue', function () {
    const queue = new Queue(builderFn, 3);

    expect(queue.dequeue()).to.deep.equals({ item: 'Foo', isItemPreBuilt: false });
  });

  it('isEmpty returns true when queue is empty', function () {
    const queue = new Queue(builderFn, 3);

    expect(queue.isEmpty()).to.be.true;
  });

  it('isEmpty returns false when queue has items', function () {
    const queue = new Queue(builderFn, 3);

    queue.enqueue();
    queue.enqueue();

    expect(queue.isEmpty()).to.be.false;
  });

  it('isFull returns true when queue has reached limit', function () {
    const queue = new Queue(builderFn, 3);

    queue.enqueue();
    queue.enqueue();
    queue.enqueue();

    expect(queue.isFull()).to.be.true;
  });

  it('isFull returns false when queue has not reached limit', function () {
    const queue = new Queue(builderFn, 3);

    queue.enqueue();
    queue.enqueue();

    expect(queue.isFull()).to.be.false;
  });
});
