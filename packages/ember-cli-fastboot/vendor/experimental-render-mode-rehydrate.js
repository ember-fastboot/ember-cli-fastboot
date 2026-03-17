/* eslint-disable prettier/prettier, no-undef */
(function() {
  if (typeof FastBoot === 'undefined') {
    var current = document.getElementById('fastboot-body-start');

    var _Ember = require.has('ember') ? require('ember').default : window.Ember;

    if (current && !_Ember) {
      console.error(`Experimental render mode rehydrate isn't working because it couldn't find Ember via AMD or global.
See https://github.com/ember-fastboot/ember-cli-fastboot/issues/938 for the current state of the fix.`);
      return;
    }

    if (
      current &&
      typeof _Ember.ViewUtils.isSerializationFirstNode === 'function' &&
      _Ember.ViewUtils.isSerializationFirstNode(current.nextSibling)
    ) {
      _Ember.ApplicationInstance.reopen({
        _bootSync: function(options) {
          if (options === undefined) {
            options = {
              _renderMode: 'rehydrate'
            };
          }

          return this._super(options);
        }
      });

      // Prevent clearRender  by removing `fastboot-body-start` which is already
      // guarded for
      current.parentNode.removeChild(current);
      var end = document.getElementById('fastboot-body-end');

      if (end) {
        end.parentNode.removeChild(end);
      }
    }
  }
})();
