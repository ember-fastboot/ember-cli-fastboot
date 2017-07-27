export default {
  name: 'test-boy',
  initialize(applicationInstance) {
    let showBodyController = applicationInstance.lookup('controller:show-body');
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    showBodyController.set('instanceInitializerBody', fastbootInfo.request.body);
  }
};
