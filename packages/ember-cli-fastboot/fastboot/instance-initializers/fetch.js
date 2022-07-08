function initialize(instance) {
  let { request } = instance.lookup('service:fastboot');
  fetch.__fastbootRequest = request;
}

export default {
  initialize,
};
