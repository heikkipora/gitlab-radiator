import _ from 'lodash'
import {gitlabRequest} from './client'

export async function fetchLatestPipelines(projectId, config) {
  const pipelines = await gitlabRequest(`/api/v4/projects/${projectId}/pipelines`, {per_page: 1}, config, false)
  return Promise.all(pipelines.map(async ({id, status}) => {
    const jobs = await fetchJobs(projectId, id, config)
    return {
      id,
      status,
      ...jobs
    }
  }))
}

async function fetchJobs(projectId, pipelineId, config) {
  const gitlabJobs = await gitlabRequest(`/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs`, {per_page: 100}, config, false)
  const {commit, ref} = _.head(gitlabJobs)
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
    .value()

  return {
    commit: {
      title: commit.title,
      author: commit.author_name
    },
    ref,
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
