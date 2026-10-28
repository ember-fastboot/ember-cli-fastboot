import Application from './app';
import config from './config/environment';

export { settled } from 'ember-cli-fastboot/settled';

export function createSsrApp() {
  return Application.create({ ...config.APP, autoboot: false });
}
