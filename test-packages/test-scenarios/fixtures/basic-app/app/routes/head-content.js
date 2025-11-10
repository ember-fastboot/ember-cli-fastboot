import { set } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class HeadContentRoute extends Route {
  @service headData;

  afterModel() {
    set(this, 'headData.title', 'Go Sounders');
  }
}
