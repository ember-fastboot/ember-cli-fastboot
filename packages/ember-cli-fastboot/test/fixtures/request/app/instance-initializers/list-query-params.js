export default {
  name: 'test-query-params',
  initialize(applicationInstance) {
    let listCookiesController = applicationInstance.lookup(
      'controller:list-query-params'
    );
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    listCookiesController.set(
      'instanceInitializerQueryParams',
      fastbootInfo.request.queryParams.foo
    );
  },
};
