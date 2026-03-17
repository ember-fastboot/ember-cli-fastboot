import Route from '@ember/routing/route';
import { run } from '@ember/runloop';

export default class ErrorRoute extends Route {

  afterModel() {
    run(function() {
      // trigger a run loop error
      let fooEl = document.querySelector('.foo-bar');
    });
  }
}
