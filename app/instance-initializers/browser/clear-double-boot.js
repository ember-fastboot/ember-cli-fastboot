/*globals Ember*/

// When using `ember fastboot --serve-assets` the application output will
// already be rendered to the DOM when the actual JavaScript loads. Ember
// does not automatically clear its `rootElement` so this leads to the
// "double" applications being visible at once (only the "bottom" one is
// running via JS and is interactive).
//
// This removes any pre-rendered ember-view elements, so that the booting
// application will replace the pre-rendered output

export default {
  name: "clear-double-boot",

  initialize: function(instance) {
    var originalDidCreateRootView = instance.didCreateRootView;

    instance.didCreateRootView = function() {
      Ember.$(instance.rootElement + ' .ember-view').remove();

      originalDidCreateRootView.apply(instance, arguments);
    };
  }
}
