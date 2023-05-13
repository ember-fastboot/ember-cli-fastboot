function initialize(instance) {
  let { request } = instance.lookup('service:fastboot');
  if (fetch) {
    fetch.__fastbootRequest = request;
  }
}

export default {
  initialize,
};
