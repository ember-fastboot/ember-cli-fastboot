// When using `ember serve` when fastboot addon is installed the application
// output will already be rendered to the DOM when the actual JavaScript
// loads. Ember does not automatically clear its `rootElement` so this
// leads to the "double" applications being visible at once (only the
// "bottom" one is running via JS and is interactive).
//
// This removes any pre-rendered ember-view elements, so that the booting
// application will replace the pre-rendered output
export function clearHtml() {
  let current = document.getElementById('fastboot-body-start');
  if (current) {
    let endMarker = document.getElementById('fastboot-body-end');
    let shoeboxNodes = document.querySelectorAll('[type="fastboot/shoebox"]');
    let shoeboxNodesArray = []; // Note that IE11 doesn't support more concise options like Array.from, so we have to do something like this
    for(let i=0; i < shoeboxNodes.length; i++){
      shoeboxNodesArray.push(shoeboxNodes[i]);
    }
    let parent = current.parentElement;
    let nextNode;
    do {
      nextNode = current.nextSibling;
      parent.removeChild(current);
      current = nextNode;
    } while (nextNode && nextNode !== endMarker && shoeboxNodesArray.indexOf(nextNode) < 0);
    endMarker.parentElement.removeChild(endMarker);
  }
}
export default {
  name: "clear-double-boot",

  initialize(instance) {
    if (typeof FastBoot === 'undefined') {
      var originalDidCreateRootView = instance.didCreateRootView;

      instance.didCreateRootView = function() {
        clearHtml();
        originalDidCreateRootView.apply(instance, arguments);
      };
    }
  }
}
