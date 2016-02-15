/*globals Ember*/

export default {
  name: "expose-cookies",

  initialize: function(instance) {
    var originalVisit = instance.visit;

    instance.visit = function(url, options) {
      console.log(options);

      originalVisit.apply(instance, arguments);
    };
  }
}
