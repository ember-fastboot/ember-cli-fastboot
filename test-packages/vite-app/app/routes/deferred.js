import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

class State {
  @tracked done = false;
}

export default class DeferredRoute extends Route {
  @service fastboot;

  model() {
    let state = new State();

    this.fastboot.deferRendering(
      new Promise((resolve) => {
        setTimeout(() => {
          state.done = true;
          resolve();
        }, 30);
      }),
    );

    return state;
  }
}
