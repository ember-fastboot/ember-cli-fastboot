'use strict';
const { expect } = require('chai');
const Project = require('fixturify-project');
const fs = require('fs');
const updateManifestFromHtml = require('../../lib/embroider/update-manifest-from-html')

describe('embroider/update-manifest-from-html', function() {
  const PROJECT = new Project('my-app');

  PROJECT.files['index.html'] = `
  <script src="a.js"></script>
  <script src="b.js"></script>
  <script src="c.js"></script>
  <script src="f"></script>
  <script src="ember-cli-live-reload.js"></script>
  <script src="testem.js"></script>
  `;

  PROJECT.pkg.fastboot = {
    manifest: {
      appFiles: ['app.js', 'my-app-fastboot.js']
    }
  };

  PROJECT.pkg['ember-addon'] = { version: 2 };

  it(`does nothing if ember-addon is empty`,  function() {
    const project = PROJECT.clone();

    delete project.pkg['ember-addon'].version;
    project.writeSync();

    const originalJSON = project.toJSON();
    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();
    expect(project.toJSON()).to.eql(originalJSON);
  });

  it(`does nothing if ember-addon is missing`,  function() {
    const project = PROJECT.clone();

    delete project.pkg['ember-addon'];
    project.writeSync();

    const originalJSON = project.toJSON();
    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();
    expect(project.toJSON()).to.eql(originalJSON);
  });
  // TODO: these heuristics being tested seem brittle, we should do something else.
  it(`works correctly ass files are added/removed`,  function() {
    const project = PROJECT.clone();


    project.files['a.js'] = '';
    project.files['b.js'] = '';
    project.files['c.js'] = '';
    project.files['d.js'] = '';
    project.files['e.js'] = '';
    project.files['f'] = '';

    project.writeSync();
    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'a.js',
      'b.js',
      'c.js',
      'f',
      'my-app-fastboot.js'
    ]);

    // let's try a rebuild
    project.writeSync();
    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'a.js',
      'b.js',
      'c.js',
      'f',
      'my-app-fastboot.js'
    ]);

    // now lets remove a file, but leave it in the HTML
    delete project.files['a.js'];

    fs.unlinkSync(project.root + '/my-app/a.js');
    project.writeSync();

    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'b.js',
      'c.js',
      'f',
      'my-app-fastboot.js'
    ]);

    // lets add a file back
    project.files['a.js'] = '';
    project.writeSync();

    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'a.js',
      'b.js',
      'c.js',
      'f',
      'my-app-fastboot.js'
    ]);

    // lets add a new src to html which is already on disk

    project.files['index.html'] += '<script src="d.js"></script>';

    project.writeSync();
    updateManifestFromHtml(project.root + '/my-app')
    project.readSync();

    expect(JSON.parse(project.toJSON('package.json')).fastboot.manifest.appFiles).to.eql([
      'a.js',
      'b.js',
      'c.js',
      'f',
      'd.js',
      'my-app-fastboot.js'
    ]);
  });
});
