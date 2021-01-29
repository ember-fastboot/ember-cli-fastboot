import Route from "@ember/routing/route";

export default class ApplicationRoute extends Route {
  model() {
    if (typeof FastBoot !== "undefined") {
      return foo;
    }
  }
}
