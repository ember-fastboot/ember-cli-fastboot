export default {
  name: 'test-path',
  initialize(applicationInstance) {
    let showHostController = applicationInstance.lookup('controller:show-path');
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    showHostController.set('instanceInitializerPath', fastbootInfo.request.path);
  }
};
