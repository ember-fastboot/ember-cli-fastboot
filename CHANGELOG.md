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
