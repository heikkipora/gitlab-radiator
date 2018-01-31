import _ from 'lodash'
import {gitlabRequest} from './client'

export async function fetchLatestPipelines(projectId, config) {
  const pipelines = await fetchLatestAndMasterPipeline(projectId, config)

  return Promise.all(pipelines.map(async ({id, ref, status}) => {
    const jobs = await fetchJobs(projectId, id, config)
    return {
      id,
      ref,
      status,
      ...jobs
    }
  }))
}

async function fetchLatestAndMasterPipeline(projectId, config) {
  const latestPipeline = await gitlabRequest(`/api/v4/projects/${projectId}/pipelines`, {per_page: 1}, config, false)
  if (latestPipeline.length === 0) {
    return []
  }
  if (latestPipeline[0].ref === 'master') {
    return latestPipeline
  }
  const masterPipeline = await gitlabRequest(`/api/v4/projects/${projectId}/pipelines`, {per_page: 1, ref: 'master'}, config, false)
  return latestPipeline.concat(masterPipeline)
}

async function fetchJobs(projectId, pipelineId, config) {
  const gitlabJobs = await gitlabRequest(`/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs`, {per_page: 100}, config, false)
  if (gitlabJobs.length === 0) {
    return {}
  }

  const {commit} = _.head(gitlabJobs)
  const stages = _(gitlabJobs)
    .map(job => ({
      id: job.id,
      status: job.status,
      stage: job.stage,
      name: job.name,
      startedAt: job.started_at,
      finishedAt: job.finished_at
    }))
    .groupBy('stage')
    .mapValues(mergeRetriedJobs)
    .mapValues(cleanup)
    .toPairs()
    .map(([name, jobs]) => ({name, jobs}))
    .value()

  return {
    commit: {
      title: commit.title,
      author: commit.author_name
    },
    stages
  }
}

function mergeRetriedJobs(jobs) {
  return _.reduce(jobs, (acc, job) => {
    const index = _.findIndex(acc, {name: job.name})
    if (index >= 0) {
      acc[index] = job
    } else {
      acc.push(job)
    }
    return acc
  }, [])
}

function cleanup(jobs) {
  return _(jobs)
    .map(job => _.omitBy(job, _.isNull))
    .map(job => _.omit(job, 'stage'))
    .value()
}
