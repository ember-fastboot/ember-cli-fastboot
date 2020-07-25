export default {
  name: 'test-method',
  initialize(applicationInstance) {
    let showMethodController = applicationInstance.lookup('controller:show-method');
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    showMethodController.set('instanceInitializerMethod', fastbootInfo.request.method);
  }
};
