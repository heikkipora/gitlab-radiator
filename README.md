The missing GitLab build radiator view
=====

Work-in-progress at the moment, stay tuned.

Configuration
----

```gitlab-radiator``` looks for its mandatory configuration file at ```~/.gitlab-radiator.yml``` by default.
It can be overridden by defining the ```GITLAB_RADIATOR_CONFIG``` environment variable.

Mandatory configuration properties:

- ```gitlab / url``` - Root URL of your GitLab installation - or that of GitLab SaaS CI
- ```gitlab / access-token``` - A GitLab access token for allowing access to the GitLab API. One can be generated with GitLab's UI under Profile Settins / Personal Access Tokens.

Example yaml syntax:

```
gitlab:
  access-token: 12invalidtoken12
  url: https://gitlab.com
```

Optional configuration properties:

- ```projects / include``` - Regular expression for inclusion of projects. Default is to include all projects.
- ```projects / exclude``` - Regular expression for exclusion of projects. Default is to exclude no projects.
- ```intervals / projects``` - Number of seconds between project list updates. Default value is 120 seconds.
- ```intervals / builds``` -  Number of seconds between build state updates. Default value is 10 seconds.
- ```port``` - HTTP port to listen on. Default value is 3000.

Example yaml syntax:

```
projects:
  include: .*/my-awesome-project-.*

intervals:
  projects: 600
  builds: 30

port: 8000
```
