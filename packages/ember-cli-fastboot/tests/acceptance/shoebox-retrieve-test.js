/* eslint-disable prettier/prettier, qunit/no-assert-equal */
import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';

module('browser acceptance test | shoebox retrieve', function(hooks) {
  setupApplicationTest(hooks);

  test('it can retrieve items from the shoebox', async function(assert) {
    await visit('/');

    assert.equal(currentURL(), '/');
    assert.equal(this.element.querySelector('.shoebox').textContent.replace(/\s+/g, ' ').trim(), 'bar zap', 'the data was retreived from the shoebox');
  });
});
