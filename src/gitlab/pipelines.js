import _ from 'lodash'
import {gitlabRequest} from './client'

export async function fetchLatestPipelines(projectId, gitlab) {
  const pipelines = await fetchLatestAndMasterPipeline(projectId, gitlab)
  const jobsForPipelines = await fetchJobsForPipelines(projectId, pipelines, gitlab)

  return pipelines.map(({id, ref, status}) => {
    const jobs = matchJobs(id, jobsForPipelines)
    return {
      id,
      ref,
      status,
      ...jobs
    }
  })
}

async function fetchLatestAndMasterPipeline(projectId, config) {
  const [latestPipeline] = await fetchNonSkippedPipelines(projectId, config, {per_page: 100})
  if (!latestPipeline) {
    return []
  }
  if (latestPipeline.ref === 'master') {
    return [latestPipeline]
  }
  const [latestMasterPipeline] = await fetchNonSkippedPipelines(projectId, config, {per_page: 50, ref: 'master'})
  return [latestPipeline].concat(latestMasterPipeline || [])
}

async function fetchNonSkippedPipelines(projectId, config, options) {
  const {data: pipelines} = await gitlabRequest(`/projects/${projectId}/pipelines`, options, config)
  return pipelines.filter(pipeline => pipeline.status !== 'skipped')
}

// GitLab API endpoint `/projects/${projectId}/pipelines/${pipelineId}/jobs` is broken and not returning all jobs
// Need to fetch all jobs for the project (from newer to older) and match later
async function fetchJobsForPipelines(projectId, pipelines, config) {
  const includedPipelineIds = pipelines.map(pipeline => pipeline.id)
  const [oldestCreatedAt] = pipelines.map(pipeline => pipeline.created_at).sort()

  const jobs = []
  const SAFETY_MAX_PAGE = 10
  for (let page = 1; page <= SAFETY_MAX_PAGE; page += 1) {
    // eslint-disable-next-line no-await-in-loop
    const {data: jobsBatch} = await gitlabRequest(`/projects/${projectId}/jobs`, {page, per_page: 100}, config)
    jobs.push(jobsBatch
      .filter(job => includedPipelineIds.includes(job.pipeline.id))
      .filter(job => job.created_at >= oldestCreatedAt))
    if (jobsBatch.length === 0 || jobsBatch[jobsBatch.length - 1].created_at < oldestCreatedAt) {
      break
    }
  }
  return jobs.flat()
}

function matchJobs(pipelineId, gitlabJobsForMultiplePipelines) {
  const gitlabJobs = gitlabJobsForMultiplePipelines.filter(job => job.pipeline.id === pipelineId)
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
      finishedAt: job.finished_at,
      url: job.web_url
    }))
    .orderBy('id')
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
  const [job] = jobs.filter(j => j.commit)
  if (!job) {
    return null
  }
  return {
    title: job.commit.title,
    author: job.commit.author_name
  }
}

function mergeRetriedJobs(jobs) {
  return jobs.reduce((mergedJobs, job) => {
    const index = mergedJobs.findIndex(mergedJob => mergedJob.name === job.name)
    if (index >= 0) {
      mergedJobs[index] = job
    } else {
      mergedJobs.push(job)
    }
    return mergedJobs
  }, [])
}

function cleanup(jobs) {
  return _(jobs)
    .map(job => _.omitBy(job, _.isNull))
    .map(job => _.omit(job, 'stage'))
    .value()
}
