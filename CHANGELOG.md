## v3.2.0-beta.4 (2021-09-14)

#### :bug: Bug Fix
* `ember-cli-fastboot`
  * [#857](https://github.com/ember-fastboot/ember-cli-fastboot/pull/857) Avoid implicit injection _fastbootInfo deprecation pt 2 ([@snewcomer](https://github.com/snewcomer))
  * [#849](https://github.com/ember-fastboot/ember-cli-fastboot/pull/849) Fix use of Ember global, breaking Ember 4 ([@simonihmig](https://github.com/simonihmig))
* `fastboot`
  * [#854](https://github.com/ember-fastboot/ember-cli-fastboot/pull/854) Support extracting fastboot specific config from meta tag ([@xg-wang](https://github.com/xg-wang))

#### :memo: Documentation
* [#826](https://github.com/ember-fastboot/ember-cli-fastboot/pull/826) Provide instructions how to debug app via VS Code ([@SergeAstapov](https://github.com/SergeAstapov))

#### Committers: 4
- Scott Newcomer ([@snewcomer](https://github.com/snewcomer))
- Sergey Astapov ([@SergeAstapov](https://github.com/SergeAstapov))
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))
- Thomas Wang ([@xg-wang](https://github.com/xg-wang))


## v3.2.0-beta.3 (2021-09-10)

#### :boom: Breaking Change
* `ember-cli-fastboot`, `fastboot-app-server`, `fastboot-express-middleware`, `fastboot`
  * [#834](https://github.com/ember-fastboot/ember-cli-fastboot/pull/834) Update using ember-cli-update and drop support for Node 10 ([@mansona](https://github.com/mansona))
* `ember-cli-fastboot`
  * [#825](https://github.com/ember-fastboot/ember-cli-fastboot/pull/825) Drop module unification support ([@xg-wang](https://github.com/xg-wang))
  * [#820](https://github.com/ember-fastboot/ember-cli-fastboot/pull/820) Remove deprecated features for ember-cli-fastboot v3 release ([@xg-wang](https://github.com/xg-wang))

#### :rocket: Enhancement
* `ember-cli-fastboot`
  * [#814](https://github.com/ember-fastboot/ember-cli-fastboot/pull/814) Throw a helpful error when people use `isFastboot` instead of `isFastBoot` ([@bertdeblock](https://github.com/bertdeblock))
* `fastboot-app-server`
  * [#811](https://github.com/ember-fastboot/ember-cli-fastboot/pull/811) [fastboot-app-server] turn on gzip by default ([@xg-wang](https://github.com/xg-wang))

#### :bug: Bug Fix
* `fastboot`
  * [#853](https://github.com/ember-fastboot/ember-cli-fastboot/pull/853) Fix fastboot-script assets with cutom root url ([@xg-wang](https://github.com/xg-wang))
  * [#840](https://github.com/ember-fastboot/ember-cli-fastboot/pull/840) Add a default state for metadata ([@suchitadoshi1987](https://github.com/suchitadoshi1987))

#### :memo: Documentation
* [#810](https://github.com/ember-fastboot/ember-cli-fastboot/pull/810) doc: update CONTRIBUTING.md for code structure and tests ([@xg-wang](https://github.com/xg-wang))

#### :house: Internal
* `ember-cli-fastboot`
  * [#841](https://github.com/ember-fastboot/ember-cli-fastboot/pull/841) Avoid implicit injection _fastbootInfo deprecation ([@snewcomer](https://github.com/snewcomer))
  * [#836](https://github.com/ember-fastboot/ember-cli-fastboot/pull/836) Restore the legacy tests ([@kiwiupover](https://github.com/kiwiupover))
* Other
  * [#842](https://github.com/ember-fastboot/ember-cli-fastboot/pull/842) Add test scripts ([@xg-wang](https://github.com/xg-wang))
  * [#832](https://github.com/ember-fastboot/ember-cli-fastboot/pull/832) Testing ember-cli-fastboot-testing in new test-package ([@ankushdharkar](https://github.com/ankushdharkar))
* `ember-cli-fastboot`, `fastboot-app-server`, `fastboot-express-middleware`, `fastboot`
  * [#821](https://github.com/ember-fastboot/ember-cli-fastboot/pull/821) Convert co to async in test; cleanup some configurations ([@xg-wang](https://github.com/xg-wang))

#### Committers: 7
- Ankush Dharkar ([@ankushdharkar](https://github.com/ankushdharkar))
- Bert De Block ([@bertdeblock](https://github.com/bertdeblock))
- Chris Manson ([@mansona](https://github.com/mansona))
- Dave Laird ([@kiwiupover](https://github.com/kiwiupover))
- Scott Newcomer ([@snewcomer](https://github.com/snewcomer))
- Suchita Doshi ([@suchitadoshi1987](https://github.com/suchitadoshi1987))
- Thomas Wang ([@xg-wang](https://github.com/xg-wang))


## v3.2.0-beta.2 (2021-01-29)

#### :bug: Bug Fix
* `ember-cli-fastboot`
  * [#808](https://github.com/ember-fastboot/ember-cli-fastboot/pull/808) Fix treeForFastBoot when project is an addon ([@simonihmig](https://github.com/simonihmig))

#### :house: Internal
* `ember-cli-fastboot`
  * [#803](https://github.com/ember-fastboot/ember-cli-fastboot/pull/803) Dave/custom fastboot app ([@kiwiupover](https://github.com/kiwiupover))

#### Committers: 2
- Dave Laird ([@kiwiupover](https://github.com/kiwiupover))
- Simon Ihmig ([@simonihmig](https://github.com/simonihmig))


## v3.2.0-beta.1 (2021-01-29)

#### :memo: Documentation
* [#800](https://github.com/ember-fastboot/ember-cli-fastboot/pull/800) Update README to match buildSandboxGlobals API ([@bobisjan](https://github.com/bobisjan))

#### :house: Internal
* `ember-cli-fastboot`, `fastboot-app-server`, `fastboot-express-middleware`, `fastboot`
  * [#805](https://github.com/ember-fastboot/ember-cli-fastboot/pull/805) Migrate to a monorepo setup ([@xg-wang](https://github.com/xg-wang))
* `ember-cli-fastboot`
  * [#795](https://github.com/ember-fastboot/ember-cli-fastboot/pull/795) Move response-details-test from legacy-tests to basic-app tests ([@kiwiupover](https://github.com/kiwiupover))

#### Committers: 73
- Jan Bobisud ([@bobisjan](https://github.com/bobisjan))
- Thomas Wang ([@xg-wang](https://github.com/xg-wang))
- Dave Laird ([@kiwiupover](https://github.com/kiwiupover))


## v3.0.0-beta.2 (2020-09-18)

#### :rocket: Enhancement
* `ember-cli-fastboot`
  * [#770](https://github.com/ember-fastboot/ember-cli-fastboot/pull/770) Add 'node: current' to the targets file on install ([@mansona](https://github.com/mansona))

#### :house: Internal
* Other
  * [#787](https://github.com/ember-fastboot/ember-cli-fastboot/pull/787) Don't update the test-package fake addon package versions ([@kiwiupover](https://github.com/kiwiupover))
* `ember-cli-fastboot`
  * [#786](https://github.com/ember-fastboot/ember-cli-fastboot/pull/786) Adding testing libs so we can tests a running ember app. ([@kiwiupover](https://github.com/kiwiupover))

#### Committers: 2
- Chris Manson ([@mansona](https://github.com/mansona))
- Dave Laird ([@kiwiupover](https://github.com/kiwiupover))


## v3.0.0-beta.1 (2020-09-18)

#### :boom: Breaking Change
* [#748](https://github.com/ember-fastboot/ember-cli-fastboot/pull/748) Update fastboot to the latest version 🚀 ([@greenkeeper[bot]](https://github.com/apps/greenkeeper))
* [#695](https://github.com/ember-fastboot/ember-cli-fastboot/pull/695) Drop Node 6, 8, 9, 11, and 13 support. ([@rwjblue](https://github.com/rwjblue))

#### :rocket: Enhancement
* `ember-cli-fastboot`
  * [#780](https://github.com/ember-fastboot/ember-cli-fastboot/pull/780) Update FastBoot to 3.1.0 ([@kiwiupover](https://github.com/kiwiupover))

#### :bug: Bug Fix
* [#772](https://github.com/ember-fastboot/ember-cli-fastboot/pull/772) Remove the second version of broccoli-file-creator from package.json ([@kiwiupover](https://github.com/kiwiupover))

#### :memo: Documentation
* [#771](https://github.com/ember-fastboot/ember-cli-fastboot/pull/771) Update README.md ([@jad359](https://github.com/jad359))

#### :house: Internal
* `ember-cli-fastboot`
  * [#783](https://github.com/ember-fastboot/ember-cli-fastboot/pull/783) Add automated release setup. ([@rwjblue](https://github.com/rwjblue))
  * [#778](https://github.com/ember-fastboot/ember-cli-fastboot/pull/778) Move package-json test to the basic-app ([@kiwiupover](https://github.com/kiwiupover))
  * [#776](https://github.com/ember-fastboot/ember-cli-fastboot/pull/776) Move asset rewriting test to test-packages/basic-app ([@kiwiupover](https://github.com/kiwiupover))
  * [#775](https://github.com/ember-fastboot/ember-cli-fastboot/pull/775) Adding basic test app ([@kiwiupover](https://github.com/kiwiupover))
  * [#767](https://github.com/ember-fastboot/ember-cli-fastboot/pull/767) Migrate to monorepo structure (to easily add test apps) ([@kiwiupover](https://github.com/kiwiupover))
* Other
  * [#774](https://github.com/ember-fastboot/ember-cli-fastboot/pull/774) Move `.gitignore` into root ([@rwjblue](https://github.com/rwjblue))
  * [#773](https://github.com/ember-fastboot/ember-cli-fastboot/pull/773) Remove travis in-favor of GitHub actions ([@kiwiupover](https://github.com/kiwiupover))
  * [#769](https://github.com/ember-fastboot/ember-cli-fastboot/pull/769) Adding github action tests ([@kiwiupover](https://github.com/kiwiupover))

#### Committers: 3
- Dave Laird ([@kiwiupover](https://github.com/kiwiupover))
- Jennifer ([@jad359](https://github.com/jad359))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.2.3 (2020-06-10)

#### :bug: Bug Fix
* [#763](https://github.com/ember-fastboot/ember-cli-fastboot/pull/763) Prevent errors when `fastboot-body-end` is not present. ([@rwjblue](https://github.com/rwjblue))

#### :memo: Documentation
* [#762](https://github.com/ember-fastboot/ember-cli-fastboot/pull/762) Update documentation on shoebox. ([@burritoIand](https://github.com/burritoIand))

#### Committers: 2
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- [@burritoIand](https://github.com/burritoIand)

## v2.2.2 (2020-04-09)

#### :rocket: Enhancement
* [#752](https://github.com/ember-fastboot/ember-cli-fastboot/pull/752) Add support for custom configuration ([@bobisjan](https://github.com/bobisjan))

#### :bug: Bug Fix
* [#737](https://github.com/ember-fastboot/ember-cli-fastboot/pull/737) Fix custom app build issue #730 ([@dnalagatla](https://github.com/dnalagatla))

#### :memo: Documentation
* [#728](https://github.com/ember-fastboot/ember-cli-fastboot/pull/728) fix typo in property name isFastboot -> isFastBoot ([@jelhan](https://github.com/jelhan))

#### :house: Internal
* [#760](https://github.com/ember-fastboot/ember-cli-fastboot/pull/760) Re-roll yarn.lock ([@kratiahuja](https://github.com/kratiahuja))
* [#738](https://github.com/ember-fastboot/ember-cli-fastboot/pull/738) Re-roll yarn.lock. ([@rwjblue](https://github.com/rwjblue))

#### Committers: 5
- Dinesh Nalagatla ([@dnalagatla](https://github.com/dnalagatla))
- Jan Bobisud ([@bobisjan](https://github.com/bobisjan))
- Jeldrik Hanschke ([@jelhan](https://github.com/jelhan))
- Krati Ahuja ([@kratiahuja](https://github.com/kratiahuja))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))


## v2.2.1 (2019-09-11)

#### :bug: Bug Fix
* [#725](https://github.com/ember-fastboot/ember-cli-fastboot/pull/725) cheerio is used outside of tests so must be a dependency ([@stefanpenner](https://github.com/stefanpenner))

## v2.2.0 (2019-09-10)

* use volta to pin node to ease development
* Added support to update manifest app files from index.html
 Embroider Support: Moved app factory module out of fastboot-app-module (#714)
* Point to ember-data-storefront instead of ember-cached-shoe (#718)
* Dev server forwards out of scope requests

## v2.1.1 (2019-06-03)

#### :bug: Bug Fix
* [#699](https://github.com/ember-fastboot/ember-cli-fastboot/pull/699) Ensure FastBoot rendered content is cleared even if the server rendered application contains malformed HTML. ([@noslouch](https://github.com/noslouch))

#### Committers: 1
- Brian Whitton ([@noslouch](https://github.com/noslouch))

## v2.1.0 (2019-05-28)

#### :rocket: Enhancement
* [#666](https://github.com/ember-fastboot/ember-cli-fastboot/pull/666) memoize existsSync calls on the fastboot instance itself ([@stefanpenner](https://github.com/stefanpenner))

#### :bug: Bug Fix
* [#692](https://github.com/ember-fastboot/ember-cli-fastboot/pull/692) Fix deprecation warning for Ember.Logger usage ([@rileyhilliard](https://github.com/rileyhilliard))
* [#690](https://github.com/ember-fastboot/ember-cli-fastboot/pull/690) Moved building fastboot config tree from postProcessTree to treeForPublic ([@dnalagatla](https://github.com/dnalagatla))

#### :memo: Documentation
* [#694](https://github.com/ember-fastboot/ember-cli-fastboot/pull/694) Add automated release setup. ([@rwjblue](https://github.com/rwjblue))

#### :house: Internal
* [#694](https://github.com/ember-fastboot/ember-cli-fastboot/pull/694) Add automated release setup. ([@rwjblue](https://github.com/rwjblue))
* [#679](https://github.com/ember-fastboot/ember-cli-fastboot/pull/679) Get tests passing again by testing against ember-data@3.8.0 instead of master ([@kiwiupover](https://github.com/kiwiupover))

#### Committers: 5
- David Laird ([@kiwiupover](https://github.com/kiwiupover))
- Dinesh Nalagatla ([@dnalagatla](https://github.com/dnalagatla))
- Riley Hilliard ([@rileyhilliard](https://github.com/rileyhilliard))
- Robert Jackson ([@rwjblue](https://github.com/rwjblue))
- Stefan Penner ([@stefanpenner](https://github.com/stefanpenner))

## 2.0.4

* Fix issue in IE11 when using `Array.from`

## 2.0.1
* Fixes issue where shoebox data was being cleared when clearing the server side content.

## 2.0.0

* Drop Node 4 support.
* Disentangle from broccoli-asset-rev (requires broccoli-asset-rev@3.0.0).

## 1.1.3

Support without rootElement

## 1.1.2

* Make FastBoot addon compatible with Ember CLI 3.0.0

## 1.1.1

* Make manifest in package.json respect outputPaths configuration in EmberApp (PR # 539) (@SergeAstapov)
* Register fastboot transform for apps to wrap non compatible asserts (PR#470) (@kratiahuja)
* Move fastboot-transform and fs-extra to depedencies in package.json (@SergeAstapov)

## 1.1.0

* Bumping `fastboot-express-middleware` to 1.1.0
