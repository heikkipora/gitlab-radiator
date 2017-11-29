const _ = require('lodash')
const Bacon = require('baconjs')
const moment = require('moment')
const request = require('request')
const url = require('url')

const config = require('./config')

const projectsProperty = repeat(config.interval.projects)
  .flatMap(fetchProjects)
  .map(filterProjects)
  .toProperty()

const buildsStream = repeat(config.interval.builds)
  .map(projectsProperty)
  .flatMap(projects => {
    return Bacon.fromArray(projects)
      .flatMapConcat(fetchBuildsForProject)
      .fold([], accumulateArray)
      .filter(builds => builds.length > 0)
      .map(builds => _.sortBy(builds, build => build.project.name))
  })

function fetchProjects() {
  return fetch('/api/v4/projects/?per_page=100&membership=true')
    .map(projects => projects.map(project => ({id: project.id, name: project.path_with_namespace})))
}

function fetchBuildsForProject(project) {
  return fetch(`/api/v4/projects/${project.id}/jobs`)
    .filter(gitlabBuilds => gitlabBuilds.length > 0)
    .map(gitlabBuilds => {
       const builds = gitlabBuilds.map(build => ({
         status: build.status,
         stage: build.stage,
         name: build.name,
         ref: build.ref,
         id: build.id,
         createdAt: build.created_at,
         startedAt: build.started_at,
         finishedAt: build.finished_at,
         pipeline: {
           id: build.pipeline.id,
           status: build.pipeline.status
         }
       }))

       const commit = _(gitlabBuilds).take(1).map(build => ({
         title: build.commit.title,
         authorName: build.commit.author_name,
         createdAt: moment(build.commit.created_at).fromNow()
       })).value()

       const newestPipelineId = _(gitlabBuilds).map(build => build.pipeline.id).max()
       const buildsForNewestPipeline = _(builds).filter(build => build.pipeline.id == newestPipelineId).orderBy('id').value()

       return {
         project: project,
         commit: commit,
         builds: mergeDuplicates(buildsForNewestPipeline)
       }
     })
}

function mergeDuplicates(builds) {
  // Use the ID of the first build to retain original execution order
  return _(builds).groupBy('stage').map(builds => _.extend({}, _.last(builds), {id: _.head(builds).id}))
}

function fetch(path) {
  const options = {
    url: url.resolve(config.gitlab.url, path),
    headers: {'PRIVATE-TOKEN': config.gitlab['access-token']},
    ca: config.ca
  }

  return Bacon.fromNodeCallback(callback => {
    request(options, (error, response, body) => {
      if (!error && response.statusCode == 200) {
        callback(null, JSON.parse(body))
      } else {
        const statusCode = response ? response.statusCode : 'n/a'
        callback(`Failed to fetch ${options.url} because of error '${error}' and/or HTTP status ${statusCode}`)
      }
    })
  })
}

function filterProjects(projects) {
  if (config.projects && config.projects.include) {
    const includeRegex = new RegExp(config.projects.include, "i")
    return _.filter(projects, project => includeRegex.test(project.name))
  } else if (config.projects && config.projects.exclude) {
    const excludeRegex = new RegExp(config.projects.exclude, "i")
    return _.filter(projects, project => !excludeRegex.test(project.name))
  }
  return projects
}

function repeat(interval) {
  const immediately = Bacon.later(0, true)
  const repeatedly = Bacon.interval(interval, true)
  return immediately.merge(repeatedly)
}

function accumulateArray(array, item) {
  array.push(item)
  return array
}

module.exports = buildsStream
