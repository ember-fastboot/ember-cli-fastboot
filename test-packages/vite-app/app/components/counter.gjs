import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { modifier } from 'ember-modifier';

const markRendered = modifier((element) => {
  element.dataset.modifier = 'ran';
});

export default class Counter extends Component {
  @tracked count = 0;

  increment = () => this.count++;

  <template>
    <button id="counter" type="button" {{on "click" this.increment}} {{markRendered}}>
      Clicked {{this.count}} times
    </button>
  </template>
}
