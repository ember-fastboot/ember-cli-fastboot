import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ShoeboxRoute extends Route {
  @service fastboot;

  async model() {
    let { shoebox } = this.fastboot;
    let value = shoebox.retrieve('answer') ?? (await loadAnswer());

    shoebox.put('answer', value);

    return value;
  }
}

/**
 * Stands for a request to an API.
 * In the browser, the value comes from the shoebox, and this does not run.
 */
async function loadAnswer() {
  if (typeof window.answerLoads === 'number') window.answerLoads++;

  return { answer: 42, html: '</script><b>' };
}
