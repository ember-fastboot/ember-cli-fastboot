export default {
  name: 'test-protocol',
  initialize(applicationInstance) {
    let showProtocolController = applicationInstance.lookup(
      'controller:show-protocol'
    );
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    showProtocolController.set(
      'instanceInitializerProtocol',
      fastbootInfo.request.protocol
    );
  },
};
