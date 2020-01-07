# [3.0.0](https://github.com/randytarampi/slamscan/compare/v2.0.5...v3.0.0) (2020-01-07)


### Features

* **package:** Blindly upgrade our dependencies for the new year and support node@10. ([9c9cc82](https://github.com/randytarampi/slamscan/commit/9c9cc8294b6ab40920d44319c1168119491ec1f4))


### BREAKING CHANGES

* **package:** Really, this is more about dropping support for node@8, but AWS is disallowing creation of node@8 lambdas today anyways, per https://docs.aws.amazon.com/lambda/latest/dg/runtime-support-policy.html.

Also, we'll also need to have real virus definitions on hand as the rewrite of `clamscan` dropped the testing mode. Which is unfortunate.

## [2.0.5](https://github.com/randytarampi/slamscan/compare/v2.0.4...v2.0.5) (2019-07-05)


### Bug Fixes

* .snyk, package.json & package-lock.json to reduce vulnerabilities ([194bf53](https://github.com/randytarampi/slamscan/commit/194bf53))
* .snyk, package.json & package-lock.json to reduce vulnerabilities ([fa57e5a](https://github.com/randytarampi/slamscan/commit/fa57e5a))
* Apply Synk patch for SNYK-JS-LODASH-450202. ([7b1f094](https://github.com/randytarampi/slamscan/commit/7b1f094))
* Apply Synk patch for SNYK-JS-LODASH-450202. ([655abfc](https://github.com/randytarampi/slamscan/commit/655abfc))

## [2.0.4](https://github.com/randytarampi/slamscan/compare/v2.0.3...v2.0.4) (2019-05-04)


### Reverts

* chore(greenkeeper): Update dependencies. ([36d0062](https://github.com/randytarampi/slamscan/commit/36d0062))

## [2.0.3](https://github.com/randytarampi/slamscan/compare/v2.0.2...v2.0.3) (2019-03-08)


### Bug Fixes

* **semantic-release:** Use `@semantic-release/git` properly ([ffeb88a](https://github.com/randytarampi/slamscan/commit/ffeb88a))
