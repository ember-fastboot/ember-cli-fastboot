import { getOnerror, setOnerror } from '@ember/-internals/error-handling';

/**
 * Initializer to attach an `onError` hook to your app running in fastboot. It catches any run loop
 * exceptions and other errors and prevents the node process from crashing.
 *
 */
export default {
  name: 'error-handler',

  initialize: function () {
    if (!getOnerror()) {
      // if no onerror handler is defined, define one for fastboot environments
      setOnerror(function (err) {
        const errorMessage = `There was an error running your app in fastboot. More info about the error: \n ${err.stack || err}`;
        console.error(errorMessage);
      });
    }
  },
};
