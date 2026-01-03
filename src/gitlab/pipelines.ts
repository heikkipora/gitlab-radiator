import _ from 'lodash'
import {gitlabRequest} from './client.ts'
import type {Commit, Pipeline, Stage} from '../common/gitlab-types.d.ts'
import type {PartialGitlab} from './client.ts'

export async function fetchLatestPipelines(projectId: number, gitlab: PartialGitlab): Promise<Pipeline[]> {
  const pipelines = await fetchLatestAndMasterPipeline(projectId, gitlab)

  const pipelinesWithStages: Pipeline[] = []
  for (const {id, ref, status} of pipelines) {
    const {commit, stages} = await fetchJobs(projectId, id, gitlab)
    const downstreamStages = await fetchDownstreamJobs(projectId, id, gitlab)
    pipelinesWithStages.push({
      id,
      ref,
      status,
      commit,
      stages: stages.concat(downstreamStages)
    })
  }
  return pipelinesWithStages
}

async function fetchLatestAndMasterPipeline(projectId: number, gitlab: PartialGitlab): Promise<any[]> {
  const pipelines = await fetchPipelines(projectId, gitlab, {per_page: 100})
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
  const masterPipelines = await fetchPipelines(projectId, gitlab, {per_page: 50, ref: 'master'})
  return latestPipeline.concat(_.take(masterPipelines, 1))
}

async function fetchPipelines(projectId: number, gitlab: PartialGitlab, options: any) {
  const {data: pipelines} = await gitlabRequest(`/projects/${projectId}/pipelines`, options, gitlab)
  return pipelines.filter((pipeline: any) => pipeline.status !== 'skipped') as any[]
}

async function fetchDownstreamJobs(projectId: number, pipelineId: number, gitlab: PartialGitlab): Promise<Stage[]> {
  const {data: gitlabBridgeJobs} = await gitlabRequest(`/projects/${projectId}/pipelines/${pipelineId}/bridges`, {per_page: 100}, gitlab)
  const childPipelines = gitlabBridgeJobs.filter((bridge: any) => bridge.downstream_pipeline !== null && bridge.downstream_pipeline.status !== 'skipped')

  const downstreamStages: Stage[][] = []
  for(const childPipeline of childPipelines) {
    const {stages} = await fetchJobs(childPipeline.downstream_pipeline.project_id, childPipeline.downstream_pipeline.id, gitlab)
    downstreamStages.push(stages.map((stage: Stage) => ({
      ...stage,
      name: `${childPipeline.stage}:${stage.name}`
    })))
  }
  return downstreamStages.flat()
}

async function fetchJobs(projectId: number, pipelineId: number, gitlab: PartialGitlab): Promise<{commit: Commit | null, stages: Stage[]}> {
  const {data: gitlabJobs} = await gitlabRequest(`/projects/${projectId}/pipelines/${pipelineId}/jobs?include_retried=true`, {per_page: 100}, gitlab)
  if (gitlabJobs.length === 0) {
    return {commit: null, stages: []}
  }

  const commit = findCommit(gitlabJobs)
  const stages = _(gitlabJobs)
    .map((job: any) => ({
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
    .map(([name, jobs]) => ({name, jobs: _.sortBy(jobs as any[], 'name')}))
    .value()

  return {
    commit,
    stages
  }
}

function findCommit(jobs: any[]): Commit | null {
  const [job] = jobs.filter(j => j.commit)
  if (!job) {
    return null
  }
  return {
    title: job.commit.title,
    author: job.commit.author_name
  }
}

function mergeRetriedJobs(jobs: any[]) {
  return jobs.reduce((mergedJobs: any[], job: any) => {
    const index = mergedJobs.findIndex(mergedJob => mergedJob.name === job.name)
    if (index >= 0) {
      mergedJobs[index] = job
    } else {
      mergedJobs.push(job)
    }
    return mergedJobs
  }, [])
}

function cleanup(jobs: any[]) {
  return _(jobs)
    .map(job => _.omitBy(job, _.isNull))
    .map(job => _.omit(job, 'stage'))
    .value()
}
