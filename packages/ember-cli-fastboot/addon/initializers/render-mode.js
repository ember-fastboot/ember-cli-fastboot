import ApplicationInstance from '@ember/application/instance';
import { isSerializationFirstNode } from '@ember/-internals/glimmer';

export function initialize() {
  if (typeof FastBoot === 'undefined') {
    var current = document.getElementById('fastboot-body-start');

    if (current && isSerializationFirstNode(current.nextSibling)) {
      ApplicationInstance.prototype._bootSyncOld =
        ApplicationInstance.prototype._bootSync;
      ApplicationInstance.prototype._bootSync = function (options) {
        this._bootSyncOld({
          ...options,
          _rendermode: 'rehydrate',
        });
      };

      // Prevent clearRender  by removing `fastboot-body-start` which is already
      // guarded for
      current.parentNode.removeChild(current);
      var end = document.getElementById('fastboot-body-end');

      if (end) {
        end.parentNode.removeChild(end);
      }
    }
  }
}

export default {
  initialize,
};
