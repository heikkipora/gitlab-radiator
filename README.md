# The missing GitLab build radiator view

## Introduction

`gitlab-radiator` is a small Node.js application for serving a [Jenkins Radiator View](https://wiki.jenkins-ci.org/display/JENKINS/Radiator+View+Plugin) inspired web view of your team's CI pipelines fetched from a GitLab CI installation running locally or remotely.

<img src="https://raw.github.com/heikkipora/gitlab-radiator/master/screenshot.png" width="50%">

[![npm version](https://badge.fury.io/js/gitlab-radiator.svg)](https://badge.fury.io/js/gitlab-radiator)
[![build status](https://travis-ci.org/heikkipora/gitlab-radiator.svg?branch=master)](https://travis-ci.org/heikkipora/gitlab-radiator)

## Pre-requisites

- Node.js v8.0.0 or newer
- A modern web browser
- An account in https://gitlab.com or an onsite installation of the [GitLab software package](https://about.gitlab.com/products).

## Installation

    npm install -g gitlab-radiator

## Usage

Create a configuration file (see [Configuration](#configuration) below) and run:

    gitlab-radiator

And if you have an onsite GitLab with HTTPS and self-signed certificates:

    NODE_TLS_REJECT_UNAUTHORIZED=0 gitlab-radiator

You might prefer providing the CA file location in configuration instead of totally disabling TLS certificate checking.

Then navigate with a browser to `http://localhost:3000` - or whatever port you did configure.

### Multi-screen support

It's possible to split the radiator view to multiple physical screens by specifying the total number of screens and the current screen with the `screens` URL parameter. The parameter value format is `XofY` where `X` is the number of the screen in question (1...total), and `Y` is the total number of screens (max 9).

Example: `http://localhost:3000/?screen=2of3`

## Configuration

`gitlab-radiator` looks for its mandatory configuration file at `~/.gitlab-radiator.yml` by default.
It can be overridden by defining the `GITLAB_RADIATOR_CONFIG` environment variable.

Mandatory configuration properties:

- `gitlabs / url` - Root URL of your GitLab installation - or that of GitLab SaaS CI
- `gitlabs / access-token` - A GitLab access token for allowing access to the GitLab API. One can be generated with GitLab's UI under Profile Settins / Personal Access Tokens. The value can alternatively be defined as `GITLAB_ACCESS_TOKEN` environment variable.

Example yaml syntax:

```
gitlabs:
  -
    access-token: 12invalidtoken12
    url: https://gitlab.com
```

Optional configuration properties:

- `gitlabs / projects / include` - Regular expression for inclusion of projects. Default is to include all projects.
- `gitlabs / projects / exclude` - Regular expression for exclusion of projects. Default is to exclude no projects.
- `gitlabs / projects / excludePipelineStatus` - Array of pipeline statuses, that should be excluded (i.e. hidden) (available statuses are `running, pending, success, failed, canceled, skipped`).
- `gitlabs / maxNonFailedJobsVisible` - Number of non-failed jobs visible for a stage at maximum. Helps with highly concurrent project pipelines becoming uncomfortably high. Default values is unlimited.
- `gitlabs / caFile` - CA file location to be passed to the request library when accessing the gitlab instance.
- `gitlabs / ignoreArchived` - Ignore archived projects. Default value is `true`
- `groupSuccessfulProjects` - If set to `true` projects with successful pipeline status are grouped by namespace. Projects with other pipeline statuses are still rendered seperately. Default value is `false`.
- `auth / username` - Enables HTTP basic authentication with the defined username and password.
- `auth / password` - Enables HTTP basic authentication with the defined username and password.
- `projectsOrder` - Array of project attributes to use for sorting projects. Default value is `['name']` (available attributes are `status, name, id, nameWithoutNamespace, group`).
- `interval` - Number of seconds between updateing projects and pipelines from GitLabs. Default value is 10 seconds.
- `port` - HTTP port to listen on. Default value is 3000.
- `zoom` - View zoom factor (to make your projects fit a display nicely). Default value is 1.0
- `columns` - Number of columns to display (to fit more projects on screen). Default value is 1
- `colors` - Define some custom colors. Available colors `success-text, success-background, failed-text, failed-background, running-text, running-background, pending-text, pending-background, skipped-text, skipped-background, created-text, created-background, light-text, dark-text, background, project-background, group-background, error-message-text, error-message-background` (you may have a look at `/public/colors.less`, the colorNames from config will replace value for `@<colorname>-color` less variable)

Example yaml syntax:

```
gitlabs:
  -
    access-token: 12invalidtoken12
    url: https://gitlab.com
    projects:
      exclude: .*/.*-inactive-project
      excludePipelineStatus: ['canceled', 'pending']
    maxNonFailedJobsVisible: 3
projectsOrder: ['status', 'name']
auth:
  username: 'radiator'
  password: 'p455w0rd'
interval: 30
port: 8000
zoom: 0.85
columns: 4
colors:
  success-background: 'rgb(0,255,0)'
```

## Changelog

See [releases](https://github.com/heikkipora/gitlab-radiator/releases).

## Breaking changes from 2.x to 3.0

- Configuration file syntax has changed so that you now can define multiple gitlab instances to poll from.
  E.g. polling from https://gitlab.com and from your own hosted https://gitlab.yourdomain.com instance of gitlab.
  Unfortunately all existing configurations for single gitlab polling have to be adjusted slightly.
- Also config param `order` has moved from `projects.order` to global `projectsOrder`, as the order has effect on all projects and not per gitlab config.

## Contributing

Pull requests are welcome. Kindly check that your code passes ESLint checks by running `npm run eslint` first.
Integration tests are (for now) skipped for pull request builds on Travis as they depend on a secret API token.

## Contributors

- Antti Oittinen ([codegeneralist](https://github.com/codegeneralist))
- Christian Wagner ([wagner-ch](https://github.com/wagner-ch/))
