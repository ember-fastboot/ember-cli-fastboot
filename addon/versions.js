import Ember from 'ember';

if (Ember.libraries) {
  Ember.libraries.register('FastBoot', 'FASTBOOT_VERSION');
  Ember.libraries.register('Ember CLI FastBoot', 'EMBER_CLI_FASTBOOT_VERSION');
}
