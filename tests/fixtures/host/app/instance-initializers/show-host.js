export default {
  name: 'test-host',
  initialize(applicationInstance) {
    let showHostController = applicationInstance.lookup('controller:show-host');
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    showHostController.set('instanceInitializerHost', fastbootInfo.host());
  }
};
