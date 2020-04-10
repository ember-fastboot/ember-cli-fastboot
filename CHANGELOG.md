## v2.2.2 (2020-04-09)

* Merge pull request #760 from ember-fastboot/yarn-sync (ca9b2ea)
* Re-roll yarn.lock (0d7ce72)
* Merge pull request #757 from ember-fastboot/revert-755-greenkeeper/release-it-13.0.0 (94c2a6c)
* Revert "Update release-it to the latest version 🚀" (1340196)
* Merge pull request #752 from zonkyio/fastboot-config (2458159)
* Add FastBoot configuration section into README (40b6634)
* Update based on review (1f6c8c2)
* Merge pull request #755 from ember-fastboot/greenkeeper/release-it-13.0.0 (715c5b1)
* Merge pull request #720 from ember-fastboot/greenkeeper/eslint-plugin-ember-7.0.0 (8e10913)
* chore(package): update lockfile yarn.lock (5fa71f5)
* chore(package): update release-it to version 13.0.0 (c48a612)
* Add support for custom configuration (12e121c)
* Re-roll yarn.lock. (#738) (6a5d6c6)
* Re-roll yarn.lock. (60b5eaa)
* Merge pull request #737 from dnalagatla/dnalagatla/fix-custom-app-build (808479b)
* Fix custom app build issue #730 (9ad8446)
* fix typo in property name isFastboot -> isFastBoot (#728) (dea2f93)
* fix typo in property name isFastboot -> isFastBoot (afadb85)
* chore(package): update eslint-plugin-ember to version 7.0.0 (66f56c1)


## v2.2.1 (2019-09-11)

* move cheerio from devDependency to dependency
* move broccoli-file-creator from devDependency to dependency

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
