'use strict';

const chai = require('chai');
const expect = chai.expect;
const fs = require('fs-extra');
const execa = require("execa");

chai.use(require('chai-fs'));

describe('generating package.json with custom htmlFile', function () {
  this.timeout(50000);

  before(async function () {
    await execa("yarn", ["build"]);
  });

  it('uses custom htmlFile in the manifest', function () {
    let pkg = fs.readJSONSync('dist/package.json');
    let manifest = pkg.fastboot.manifest;

    expect(manifest.htmlFile).to.equal('custom-index.html');
    expect(`dist/${manifest.htmlFile}`).to.be.a.file();
  });
});

