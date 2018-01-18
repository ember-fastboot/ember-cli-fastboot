// When using `ember serve` when fastboot addon is installed the application
// output will already be rendered to the DOM when the actual JavaScript
// loads. Ember does not automatically clear its `rootElement` so this
// leads to the "double" applications being visible at once (only the
// "bottom" one is running via JS and is interactive).
//
// This removes any pre-rendered ember-view elements, so that the booting
// application will replace the pre-rendered output

export default {
  name: "clear-double-boot",

  initialize: function(instance) {
    if (typeof FastBoot === 'undefined') {
      var originalDidCreateRootView = instance.didCreateRootView;

      instance.didCreateRootView = function() {
        let current = document.getElementById('fastboot-body-start');
        if (current) {
          let endMarker = document.getElementById('fastboot-body-end');
          let parent = current.parentElement;
          let nextNode;
          do {
            nextNode = current.nextSibling;
            parent.removeChild(current);
            current = nextNode;
          } while(nextNode && nextNode !== endMarker);
          parent.removeChild(endMarker);
        }
        originalDidCreateRootView.apply(instance, arguments);
      };
    }
  }
}
