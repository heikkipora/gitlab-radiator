const _ = require('lodash')
const Bacon = require('baconjs')
const moment = require('moment')
const request = require('request')

function fetch(options) {
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

function fetchProjects(config) {
  return fetch({url: `${config.url}/api/v3/projects/`, headers: {'PRIVATE-TOKEN': config['access-token']}})
           .map(projects => {
               return projects.map(project => {
                 return {
                   id: project.id,
                   name: project.path_with_namespace
                 }
               })
             })
}

function fetchBuilds(config) {
  return project => {
    return fetch({url: `${config.url}/api/v3/projects/${project.id}/builds`, headers: {'PRIVATE-TOKEN': config['access-token']}})
             .filter(gitlabBuilds => gitlabBuilds.length > 0)
             .map(gitlabBuilds => {
                 const builds = gitlabBuilds.map(build => {
                   return {
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
                   }
                 })

                 const commit = _(gitlabBuilds).take(1).map(build => {
                   return {
                     title: build.commit.title,
                     authorName: build.commit.author_name,
                     createdAt: moment(build.commit.created_at).fromNow()
                   }
                 }).value()

                 const newestPipelineId = _(builds).map(build => build.pipeline.id).max()

                 return {
                   project: project,
                   commit: commit,
                   builds: _(builds).filter(build => build.pipeline.id == newestPipelineId).orderBy('id').value()
                 }
               })
  }
}

module.exports = {
  fetchBuilds,
  fetchProjects
}
