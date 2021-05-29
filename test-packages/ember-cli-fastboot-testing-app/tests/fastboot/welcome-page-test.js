import { module, test } from 'qunit';
import { setup, visit } from 'ember-cli-fastboot-testing/test-support';

module('FastBoot | home-page', function(hooks) {
  setup(hooks);

  test('it renders the welcome page', async function(assert) {
    await visit('/');
    assert.dom('[data-test-welcome-header]').hasText('Welcome to Ember');
  });
});
