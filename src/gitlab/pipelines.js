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

// eslint-disable-next-line max-statements
async function fetchLatestAndMasterPipeline(projectId, config) {
  const pipelines = await fetchPipelines(projectId, config, {per_page: 100})
  if (pipelines.length === 0) {
    return []
  }
  const latestPipeline = _.take(pipelines, 1)
  if (latestPipeline[0].ref === 'master') {
    return latestPipeline
  }
  const latestMasterPipeline = _(pipelines).filter({ref: 'master'}).take(1).value()
  if (latestMasterPipeline.length > 0) {
    return latestPipeline.concat(latestMasterPipeline)
  }
  const masterPipelines = await fetchPipelines(projectId, config, {per_page: 50, ref: 'master'})
  return latestPipeline.concat(_.take(masterPipelines, 1))
}

async function fetchPipelines(projectId, config, options) {
  const pipelines = await gitlabRequest(`/api/v4/projects/${projectId}/pipelines`, options, config, false)
  return pipelines.filter(pipeline => pipeline.status !== 'skipped')
}

async function fetchJobs(projectId, pipelineId, config) {
  const gitlabJobs = await gitlabRequest(`/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs`, {per_page: 100}, config, false)
  if (gitlabJobs.length === 0) {
    return {}
  }

  const commit = findCommit(gitlabJobs)
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
    .map(([name, jobs]) => ({name, jobs: _.sortBy(jobs, 'name')}))
    .value()

  return {
    commit,
    stages
  }
}

function findCommit(jobs) {
  const job = _(jobs).filter(j => j.commit).head()
  if (job && job.commit) {
    return {
      title: job.commit.title,
      author: job.commit.author_name
    }
  }
  return null
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
