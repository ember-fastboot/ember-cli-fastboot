export default {
  name: 'test-path',
  initialize(applicationInstance) {
    let showPathController = applicationInstance.lookup('controller:show-path');
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    showPathController.set(
      'instanceInitializerPath',
      fastbootInfo.request.path
    );
  },
};
