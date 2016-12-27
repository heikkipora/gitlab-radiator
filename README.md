The missing GitLab build radiator view
=====

Work-in-progress at the moment, stay tuned.

Configuration
----

gitlab-radiator looks for its mandatory configuration file at ```~/.gitlab-radiator.yml``` by default.
It can be overridden by defining the ```GITLAB_RADIATOR_CONFIG``` environment variable.

All projects with build pipelines are shown by default. If you want to limit that, specify either an ```include``` or ```exclude``` regular expression under ```projects``` .

```
gitlab:
  access-token: <your access-token>
  url: https://ci.gitlab.com

projects:
  include: .*/my-awesome-project-.*

intervals:
  projects: 120
  builds: 10

port: 3000
```

The configuration file is automatically reloaded once every two minutes.
It can be overridden by defining the ```GITLAB_RADIATOR_CONFIG_POLL_INTERVAL_SEC``` environment variable.
