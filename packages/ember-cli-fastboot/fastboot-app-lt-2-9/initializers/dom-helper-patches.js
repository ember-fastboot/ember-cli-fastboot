/* eslint-disable no-redeclare, no-unused-vars, prettier/prettier */
/*globals Ember, URL*/
export default {
  name: "dom-helper-patches",

  initialize: function(App) {
    // TODO: remove me
    Ember.HTMLBars.DOMHelper.prototype.protocolForURL = function(url) {
      var protocol = URL.parse(url).protocol;
      return (protocol == null) ? ':' : protocol;
    };

    // TODO: remove me https://github.com/tildeio/htmlbars/pull/425
    Ember.HTMLBars.DOMHelper.prototype.parseHTML = function(html) {
      return this.document.createRawHTMLSection(html);
    };
  }
};
