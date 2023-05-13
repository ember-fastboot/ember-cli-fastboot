import Route from '@ember/routing/route';
import { assert } from '@ember/debug';

export default class FetchRoute extends Route {
  beforeModel() {
    assert('fetch is available', fetch);
    assert('Request is available', Request);
    assert('Response is available', Response);
    assert('Headers is available', Headers);
    assert('AbortController is available', AbortController);
  }

  async model() {
    let responses = await Promise.all([
      fetch('http://localhost:45678/absolute-url.json'),
      fetch(new Request('http://localhost:45678/absolute-request.json')),
      fetch('//localhost:45678/protocol-relative-url.json'),
      fetch(new Request('//localhost:45678/protocol-relative-request.json')),
      fetch('/path-relative-url.json'),
      fetch(new Request('/path-relative-request.json')),
    ]);

    responses = await Promise.all(responses.map((response) => response.json()));

    return responses.map((response) => response.response).join('|');
  }
}
