module.exports = {
  name: "Fake Addon with Fastboot config",
  fastbootConfigTree() {
    return {
      [this.app.name]: {
        'foo': 'bar'
      }
    }
  }
};
