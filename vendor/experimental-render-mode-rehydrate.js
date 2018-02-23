(function() {
  if (typeof FastBoot === 'undefined') {
    var current = document.getElementById('fastboot-body-start');

    if (current && current.nextSibling.nodeValue === '%+b:0%') {
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
      end.parentNode.removeChild(end);
    }
  }
})();
