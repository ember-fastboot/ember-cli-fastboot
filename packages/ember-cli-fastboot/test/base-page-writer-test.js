/* eslint-env node */
'use strict';

const expect = require('chai').expect;
const helpers = require('broccoli-test-helper');
const createBuilder = helpers.createBuilder;
const createTempDir = helpers.createTempDir;
const BasePageWriter = require('../lib/broccoli/base-page-writer');

describe('BasePageWriter', function () {
  let input;
  let output;
  let subject;
  let project;
  function getOptions(overrides = {}) {
    return {
      project,
      appConfig: {
        modulePrefix: 'basic-app',
        environment: 'development',
        rootURL: overrides.rootURL || '/',
        locationType: 'auto',
        EmberENV: {
          FEATURES: {},
          EXTEND_PROTOTYPES: {
            Date: false,
          },
          _APPLICATION_TEMPLATE_WRAPPER: false,
          _DEFAULT_ASYNC_OBSERVERS: true,
          _JQUERY_INTEGRATION: false,
          _TEMPLATE_ONLY_GLIMMER_COMPONENTS: true,
        },
        APP: {
          name: 'basic-app',
          version: '0.1.0+aec2e45f',
          autoboot: false,
        },
        fastboot: {
          hostWhitelist: [
            'example.com',
            'subdomain.example.com',
            '/localhost:\\d+/',
          ],
        },
        exportApplicationGlobal: true,
      },
      outputPaths: {
        app: {
          css: {
            app: '/assets/basic-app.css',
          },
          js: '/assets/basic-app.js',
          html: 'index.html',
        },
        tests: {
          js: '/assets/tests.js',
        },
        vendor: {
          css: '/assets/vendor.css',
          js: '/assets/vendor.js',
        },
        testSupport: {
          css: '/assets/test-support.css',
          js: {
            testSupport: '/assets/test-support.js',
            testLoader: '/assets/test-loader.js',
          },
        },
      },
    };
  }

  beforeEach(async function () {
    input = await createTempDir();
    project = {
      addons: [],
      pkg: {},
    };
  });

  afterEach(async function () {
    await input.dispose();
    await output.dispose();
  });

  it('it writes correct base page HTML', async function () {
    input.write({
      'index.html': INPUT_HTML,
    });
    subject = new BasePageWriter(input.path(), getOptions());
    output = createBuilder(subject);
    await output.build();

    expect(output.read()['index.html'].replace(/(^[ \t]*\n)/gm, '')).to.equal(
      `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>BasicApp</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">


<meta name="basic-app/config/environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D">
<!-- EMBER_CLI_FASTBOOT_TITLE --><!-- EMBER_CLI_FASTBOOT_HEAD -->

    <link integrity="" rel="stylesheet" href="/assets/vendor.css">
    <link integrity="" rel="stylesheet" href="/assets/basic-app.css">


  <meta name="basic-app/config/fastboot-environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%2C%22autoboot%22%3Afalse%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D">

</head>
  <body>
    <!-- EMBER_CLI_FASTBOOT_BODY -->

    <script src="/assets/vendor.js"></script>
    <fastboot-script src="assets/basic-app-fastboot.js"></fastboot-script>
<script src="/assets/basic-app.js"></script>

</body></html>`.replace(/(^[ \t]*\n)/gm, '')
    );
  });

  it('it writes addon fastboot config to base page', async function () {
    input.write({
      'index.html': INPUT_HTML,
    });
    subject = new BasePageWriter(input.path(), getOptions());
    output = createBuilder(subject);
    project.addons.push({
      name: 'example-addon',
      updateFastBootManifest: function (manifest) {
        manifest.vendorFiles.unshift('example-addon/foo.js');
        manifest.appFiles.push('example-addon/bar.js');
        return manifest;
      },
      fastbootConfigTree() {
        return {
          'example-addon': {
            foo: 'bar',
          },
        };
      },
    });

    await output.build();

    expect(
      output.read()['index.html'].replace(/(^[ \t]*\n)/gm, ''),
      'example-addon config and manifest updates are written to base page'
    ).to.equal(
      `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>BasicApp</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">


<meta name="basic-app/config/environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D">
<!-- EMBER_CLI_FASTBOOT_TITLE --><!-- EMBER_CLI_FASTBOOT_HEAD -->

    <link integrity="" rel="stylesheet" href="/assets/vendor.css">
    <link integrity="" rel="stylesheet" href="/assets/basic-app.css">


  <meta name="basic-app/config/fastboot-environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%2C%22autoboot%22%3Afalse%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D">
<meta name="example-addon/config/fastboot-environment" content="%7B%22foo%22%3A%22bar%22%7D">

</head>
  <body>
    <!-- EMBER_CLI_FASTBOOT_BODY -->

    <script src="/assets/vendor.js"></script>
    <fastboot-script src="example-addon/foo.js"></fastboot-script>
<fastboot-script src="assets/basic-app-fastboot.js"></fastboot-script>
<fastboot-script src="example-addon/bar.js"></fastboot-script>
<script src="/assets/basic-app.js"></script>

</body></html>`.replace(/(^[ \t]*\n)/gm, '')
    );
  });

  it('it works with custom root url', async function () {
    input.write({
      'index.html': INPUT_CUSTOM_ROOT_HTML,
    });
    subject = new BasePageWriter(
      input.path(),
      getOptions({ rootURL: '/root-url/' })
    );
    output = createBuilder(subject);

    await output.build();

    expect(
      output.read()['index.html'].replace(/(^[ \t]*\n)/gm, ''),
      'example-addon config and manifest updates are written to base page'
    ).to.equal(
      `<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>BasicApp</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">


<meta name="basic-app/config/environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2Froot-url%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D">
<!-- EMBER_CLI_FASTBOOT_TITLE --><!-- EMBER_CLI_FASTBOOT_HEAD -->

    <link integrity="" rel="stylesheet" href="/root-url/assets/vendor.css">
    <link integrity="" rel="stylesheet" href="/root-url/assets/basic-app.css">


  <meta name="basic-app/config/fastboot-environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2Froot-url%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%2C%22autoboot%22%3Afalse%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D">

</head>
  <body>
    <!-- EMBER_CLI_FASTBOOT_BODY -->

    <script src="/root-url/assets/vendor.js"></script>
    <fastboot-script src="assets/basic-app-fastboot.js"></fastboot-script>
<script src="/root-url/assets/basic-app.js"></script>

</body></html>`.replace(/(^[ \t]*\n)/gm, '')
    );
  });
});

const INPUT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>BasicApp</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">


<meta name="basic-app/config/environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D" />
<!-- EMBER_CLI_FASTBOOT_TITLE --><!-- EMBER_CLI_FASTBOOT_HEAD -->

    <link integrity="" rel="stylesheet" href="/assets/vendor.css">
    <link integrity="" rel="stylesheet" href="/assets/basic-app.css">


  </head>
  <body>
    <!-- EMBER_CLI_FASTBOOT_BODY -->

    <script src="/assets/vendor.js"></script>
    <script src="/assets/basic-app.js"></script>


  </body>
</html>`;

const INPUT_CUSTOM_ROOT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>BasicApp</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">


<meta name="basic-app/config/environment" content="%7B%22modulePrefix%22%3A%22basic-app%22%2C%22environment%22%3A%22development%22%2C%22rootURL%22%3A%22%2Froot-url%2F%22%2C%22locationType%22%3A%22auto%22%2C%22EmberENV%22%3A%7B%22FEATURES%22%3A%7B%7D%2C%22EXTEND_PROTOTYPES%22%3A%7B%22Date%22%3Afalse%7D%2C%22_APPLICATION_TEMPLATE_WRAPPER%22%3Afalse%2C%22_DEFAULT_ASYNC_OBSERVERS%22%3Atrue%2C%22_JQUERY_INTEGRATION%22%3Afalse%2C%22_TEMPLATE_ONLY_GLIMMER_COMPONENTS%22%3Atrue%7D%2C%22APP%22%3A%7B%22name%22%3A%22basic-app%22%2C%22version%22%3A%220.1.0%2Baec2e45f%22%7D%2C%22fastboot%22%3A%7B%22hostWhitelist%22%3A%5B%22example.com%22%2C%22subdomain.example.com%22%2C%22%2Flocalhost%3A%5C%5Cd%2B%2F%22%5D%7D%2C%22exportApplicationGlobal%22%3Atrue%7D" />
<!-- EMBER_CLI_FASTBOOT_TITLE --><!-- EMBER_CLI_FASTBOOT_HEAD -->

    <link integrity="" rel="stylesheet" href="/root-url/assets/vendor.css">
    <link integrity="" rel="stylesheet" href="/root-url/assets/basic-app.css">


  </head>
  <body>
    <!-- EMBER_CLI_FASTBOOT_BODY -->

    <script src="/root-url/assets/vendor.js"></script>
    <script src="/root-url/assets/basic-app.js"></script>


  </body>
</html>`;
