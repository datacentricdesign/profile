# [Profile](https://datacentricdesign.org/tools/profile)

![version](https://img.shields.io/badge/version-0.0.6-blue.svg)
![license](https://img.shields.io/badge/license-MIT-blue.svg)

[![GitHub issues open](https://img.shields.io/github/issues/datacentricdesign/profile.svg?maxAge=2592000)]()
[![GitHub issues closed](https://img.shields.io/github/issues-closed-raw/datacentricdesign/profile.svg?maxAge=2592000)]()


![Docker Cloud Build Status (UI)](https://img.shields.io/docker/cloud/build/datacentricdesign/profile-ui?label=docker%20build%20%28ui%29)
![Docker Cloud Build Status (API)](https://img.shields.io/docker/cloud/build/datacentricdesign/profile-api?label=docker%20build%20%28api%29)


User management of the Data-Centric Design tools

[Profile page](https://datacentricdesign.org/profile)

## Making a new release

```
git checkout -b release-0.0.x develop
```

Bumb versions: in readme, in both package.json, in docker-compose.yml

```
cd profile-ui
npm publish
cd profile-api
npm publish
git commit -a -m "Bumped version number to 0.0.x"
git checkout master
git merge --no-ff release-0.0.x
git tag -a 0.0.x
git push --follow-tags
git checkout develop
git merge --no-ff release-0.0.x
git branch -d release-0.0.x
```