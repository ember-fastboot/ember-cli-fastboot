/* eslint-disable prettier/prettier */
export default {
  name: 'test-cookies',
  initialize(applicationInstance) {
    let listCookiesController = applicationInstance.lookup('controller:list-cookies');
    let fastbootInfo = applicationInstance.lookup('info:-fastboot');

    listCookiesController.set('instanceInitializerCookie', fastbootInfo.request.cookies.city);
  }
};
