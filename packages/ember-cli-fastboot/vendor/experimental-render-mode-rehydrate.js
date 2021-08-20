(function() {
  if (typeof FastBoot === 'undefined') {
    var current = document.getElementById('fastboot-body-start');
    var Ember = require('ember').default;

    if (
      current &&
      typeof Ember.ViewUtils.isSerializationFirstNode === 'function' &&
      Ember.ViewUtils.isSerializationFirstNode(current.nextSibling)
    ) {
      Ember.ApplicationInstance.reopen({
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
