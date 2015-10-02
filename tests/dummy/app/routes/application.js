import Ember from 'ember';

const { get } = Ember;

export default Ember.Route.extend({
  actions: {
    didTransition: function() {
      let renderer = this.container.lookup('renderer:-dom');
      if (renderer) {
        let document = get(renderer, '_dom.document');
        if (!document) { return; }
        let element;
        element = document.createElement('title');
        element.appendChild(document.createTextNode('Application Route -- Title'));
        document.head.appendChild(element);

        element = document.createElement('meta');
        element.setAttribute('name', 'description');
        element.setAttribute('content', 'something here');
        document.head.appendChild(element);

        element = document.createElement('meta');
        element.setAttribute('property', 'og:image');
        element.setAttribute('content', 'http://placehold.it/500x500');
        document.head.appendChild(element);
      }
    }
  }
});
