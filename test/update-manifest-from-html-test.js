'use strict';
const { expect } = require('chai');
const Project = require('fixturify-project');
const fixturify = require('fixturify');
const fs = require('fs');
const updateManifestFromHtml = require('../lib/embroider/update-manifest-from-html')

describe('embroider/update-manifest-from-html', function() {
  const PROJECT = new Project('my-app');

  PROJECT.files['index.html'] = `
  <script src="a.js"></script>
  <script src="b.js"></script>
  <script src="%PLACEHOLDER[c.js]%"></script>
  <script src="/some_context_path/e.js"></script>
  <script src="chunk-12.js"></script>
  <script src="chunk-12.test.js"></script>
  <script src="fastboot-ignore.js" data-fastboot-ignore></script>
  <script src="ember-cli-live-reload.js"></script>
  <script src="testem.js"></script>
  <script src="assets/vendor.js"></script>
  <script src="assets/vendor-static.js"></script>
  `;

  PROJECT.pkg.fastboot = {
    manifest: {
      htmlFile: 'index.html',
      appFiles: ['assets/app.js', 'assets/my-app-fastboot.js'],
      vendorFiles:['assets/vendor.js', 'assets/vendor-static.js']
    }
  };
  const project = PROJECT.clone();
  project.writeSync();
  const files = {};
  files['a.js'] = '';
  files['b.js'] = '';
  files['c.js'] = '';
  files['d.js'] = '';
  files['e.js'] = '';
  files['chunk-12.js'] = '';
  files['chunk-12.test.js'] = '';

  it(`works correctly as files are added/removed`,  function() {
    fixturify.writeSync(project.root + '/my-app/assets', files);
    updateManifestFromHtml(project.root + '/my-app');
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'assets/a.js',
      'assets/b.js',
      'assets/c.js',
      'assets/e.js',
      'assets/chunk-12.js',
      'assets/chunk-12.test.js',
      'assets/my-app-fastboot.js'
    ]);
  });

  it(`Rebuild doesn't change anything if files didn't change`,  function() {
    // let's try a rebuild
    fixturify.writeSync(project.root + '/my-app/assets', files);
    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'assets/a.js',
      'assets/b.js',
      'assets/c.js',
      'assets/e.js',
      'assets/chunk-12.js',
      'assets/chunk-12.test.js',
      'assets/my-app-fastboot.js'
    ]);
  });

  it(`updates when remove a file, but leave it in the HTML`, function() {
    // now lets remove a file, but leave it in the HTML
    delete files['a.js'];
    fs.unlinkSync(project.root + '/my-app/assets/a.js');
    fixturify.writeSync(project.root + '/my-app/assets', files);

    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'assets/b.js',
      'assets/c.js',
      'assets/e.js',
      'assets/chunk-12.js',
      'assets/chunk-12.test.js',
      'assets/my-app-fastboot.js'
    ]);
  });

  it(`updates when a file is added file deleted previously`, function() {
    // lets add a file back
    files['a.js'] = '';
    fixturify.writeSync(project.root + '/my-app/assets', files);

    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'assets/a.js',
      'assets/b.js',
      'assets/c.js',
      'assets/e.js',
      'assets/chunk-12.js',
      'assets/chunk-12.test.js',
      'assets/my-app-fastboot.js'
    ]);
  });

  it(`updates when a new src added to html which is already on disk`, function() {
    // lets add a new src to html which is already on disk

    project.files['index.html'] += '<script src="d.js"></script>';

    project.writeSync();
    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'assets/a.js',
      'assets/b.js',
      'assets/c.js',
      'assets/e.js',
      'assets/chunk-12.js',
      'assets/chunk-12.test.js',
      'assets/d.js',
      'assets/my-app-fastboot.js'
    ]);
  });
});
