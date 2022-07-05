function initialize(instance) {
  let { request } = instance.lookup('service:fastboot');
  fetch.__fastbootRequest = request;
}

export default {
  name: 'fastboot:fetch', // `ember-fetch` addon registers as `fetch`
  initialize,
};
