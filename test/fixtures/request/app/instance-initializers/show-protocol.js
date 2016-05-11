export default {
  name: 'test-protocol',
  initialize(applicationInstance) {
    let showHostController = applicationInstance.lookup('controller:show-protocol');
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    showHostController.set('instanceInitializerProtocol', fastbootInfo.request.protocol);
  }
};
