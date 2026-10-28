import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { later } from '@ember/runloop';

export default class Later extends Component {
  @tracked text = 'waiting';

  constructor(owner, args) {
    super(owner, args);

    later(() => (this.text = 'later done'), 30);
  }

  <template>
    <p id="later">{{this.text}}</p>
  </template>
}
