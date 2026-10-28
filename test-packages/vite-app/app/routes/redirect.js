import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class RedirectRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('about');
  }
}
