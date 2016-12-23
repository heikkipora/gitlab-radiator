The missing GitLab build radiator view
=====

Work-in-progress at the moment, stay tuned.

Configuration
----

gitlab-radiator looks for its mandatory configuration file at ```~/.gitlab-radiator.yml``` by default.
It can be overridden by defining the ```GITLAB_RADIATOR_CONFIG``` environment variable.

All projects with build pipelines are shown by default. If you want to limit that, specify a list
of projects under ```projects:``` (as namespace/project-name).

```
gitlab:
  access-token: <your access-token>
  url: https://ci.gitlab.com

projects:
  - me/my-awesome-project-1
  - me/my-awesome-project-2
```

The configuration file is automatically reloaded once every two minutes.
It can be overridden by defining the ```GITLAB_RADIATOR_CONFIG_POLL_INTERVAL_SEC``` environment variable.
