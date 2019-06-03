import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clearHtml } from 'ember-cli-fastboot/instance-initializers/clear-double-boot';

module('Instance-initializer: clear-double-boot', function(hooks) {
  setupRenderingTest(hooks);

  test('It removes the fastboot markers and anything between them', async function(assert) {
    await render(hbs`
      <script type="x/boundary" id="fastboot-body-start"></script>
      <div id="content-in-between"></div>
      <script type="x/boundary" id="fastboot-body-end"></script>
    `);
    clearHtml();
    assert.notOk(this.element.querySelector('#fastboot-body-start'), 'There is no start marker');
    assert.notOk(this.element.querySelector('#fastboot-body-end'), 'There is no end marker');
    assert.notOk(this.element.querySelector('#content-in-between'), 'The content is between is gone');
  });

  test('It can handle bad markup', async function(assert) {
    this.set('BAD_HTML', `
      <script type="x/boundary" id="fastboot-body-start"></script>
      <div id="content-in-between">
        <em><em>
      </div>
      <script type="x/boundary" id="fastboot-body-end"></script>
    `);

    // render the whole tree dynamically to more closely mimc bad markup cases
    await render(hbs`{{{BAD_HTML}}}`);

    clearHtml();
    assert.notOk(this.element.querySelector('#fastboot-body-start'), 'There is no start marker');
    assert.notOk(this.element.querySelector('#fastboot-body-end'), 'There is no end marker');
    assert.notOk(this.element.querySelector('#content-in-between'), 'The content is between is gone');
  })
});
