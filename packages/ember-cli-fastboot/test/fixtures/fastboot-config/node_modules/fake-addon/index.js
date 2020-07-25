module.exports = {
  name: "Fake Addon",

  fastbootConfigTree() {
    return {
      [this.app.name]: {
        'foo': 'bar'
      }
    }
  }
};
