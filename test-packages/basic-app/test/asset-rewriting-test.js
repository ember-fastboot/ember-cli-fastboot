const chai = require('chai');
const expect = chai.expect;
const glob = require("glob");
const execa = require("execa");

chai.use(require('chai-fs'));

describe.only('rewriting HTML', function () {
  this.timeout(100000);

  it('builds an index.html that points to the browser build', async function () {

    await execa("yarn", ["build", "--environment=production"]);

    let appPath = glob.sync('dist/assets/basic-app-*.js')[0];
    let matches = appPath.match(/dist\/assets\/basic-app-(.*).js/);
    let appSHA = matches[1];

    expect('dist/index.html').to.have.content.that.match(new RegExp(appSHA));
  });
});
