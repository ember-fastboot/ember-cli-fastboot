/* eslint-disable no-undef */
(function () {
  if (typeof FastBoot === 'undefined') {
    var current = document.getElementById('fastboot-body-start');

    if (!current) {
      return;
    }

    var isSerializationFirstNode;
    var ApplicationInstance;

    if (require.has('@ember/-internals/glimmer') && require.has('@ember/application/instance')) {
      isSerializationFirstNode = require('@ember/-internals/glimmer').isSerializationFirstNode;
      ApplicationInstance = require('@ember/application/instance').default;
    } else if (require.has('ember')) {
      var _Ember = require('ember').default;
      isSerializationFirstNode = _Ember.ViewUtils.isSerializationFirstNode;
      ApplicationInstance = _Ember.ApplicationInstance;
    } else if (window.Ember) {
      isSerializationFirstNode = window.Ember.ViewUtils.isSerializationFirstNode;
      ApplicationInstance = window.Ember.ApplicationInstance;
    }

    if (!isSerializationFirstNode || !ApplicationInstance) {
      console.error(`Experimental render mode rehydrate isn't working because it couldn't find Ember via AMD or global.
See https://github.com/ember-fastboot/ember-cli-fastboot/issues/938 for the current state of the fix.`);
      return;
    }

    if (
      typeof isSerializationFirstNode === 'function' &&
      isSerializationFirstNode(current.nextSibling)
    ) {
      ApplicationInstance.reopen({
        _bootSync: function(options) {
          if (options === undefined) {
            options = {
              _renderMode: 'rehydrate',
            };
          }

          return this._super(options);
        },
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
