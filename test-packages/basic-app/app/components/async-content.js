import { defer } from 'rsvp';
import { later } from '@ember/runloop';
import fetch from 'fetch';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class AsyncContenComponent extends Component {
  @service fastboot;

  @tracked setLater = null;

  constructor() {
    super(...arguments);
    this.loadAsync();
  }

  // async loadAsync() {
  //   if (this.fastboot.isFastBoot) {
  //     const url = `https://www.outdoorsy.com/wp-json/wp/v2/posts?categories=1723&_embed&page=1&per_page=3`;
  //     let request = this.apiRequest.request(url);

  //     if (this.fastboot.isFastBoot) {
  //       this.fastboot.deferRendering(request);
  //     }

  //     let blogContent = yield request;

  //     let processedBlog = blogContent.map(post => processPost(post));

  //     this.fastboot.shoebox.put('homepage-blog', processedBlog);
  //     return processedBlog;
  //   }

  //   return this.fastboot.shoebox.retrieve('homepage-blog') || defaultBlogData;
  // };

  async loadAsync() {
    const url = 'https://swapi.dev/api/starships/12';
    const deferred = fetch(url);

    if (this.fastboot.isFastBoot) {
      this.fastboot.deferRendering(deferred);
    }

    const response = await deferred;
    const { model } = await response.json();

    debugger;

    this.setLater = model;
    console.log('setLater', this.setLater);
  }
}
