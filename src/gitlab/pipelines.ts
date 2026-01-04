import {gitlabRequest} from './client.ts'
import type {Commit, Job, JobStatus, Pipeline, Stage} from '../common/gitlab-types.d.ts'
import type {GitlabRequestParams, PartialGitlab} from './client.ts'

interface GitlabPipelineResponse {
  id: number
  ref: string
  status: JobStatus
}

// project_id is undocumented by docs.gitlab.com but is present in the API response
interface GitlabDownstreamPipeline {
  id: number
  project_id: number
  status: JobStatus
}

interface GitlabPipelineTriggerResponse {
  stage: string
  downstream_pipeline: GitlabDownstreamPipeline | null
}

interface GitlabJobResponse {
  id: number
  name: string
  stage: string
  status: JobStatus
  started_at: string | null
  finished_at: string | null
  web_url: string
  commit: {
    title: string
    author_name: string
  } | null
}

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

async function fetchLatestAndMasterPipeline(projectId: number, gitlab: PartialGitlab): Promise<GitlabPipelineResponse[]> {
  const options = {
    per_page: 100,
    ...(gitlab.branch ? {ref: gitlab.branch} : {})
  }
  const pipelines = await fetchPipelines(projectId, gitlab, options)
  if (pipelines.length === 0) {
    return []
  }
  const latestPipeline = pipelines.slice(0, 1)
  if (latestPipeline[0].ref === 'master') {
    return latestPipeline
  }
  const latestMasterPipeline = pipelines.filter(p => p.ref === 'master').slice(0, 1)
  if (latestMasterPipeline.length > 0) {
    return latestPipeline.concat(latestMasterPipeline)
  }
  const masterPipelines = await fetchPipelines(projectId, gitlab, {per_page: 50, ref: 'master'})
  return latestPipeline.concat(masterPipelines.slice(0, 1))
}

async function fetchPipelines(projectId: number, gitlab: PartialGitlab, params: GitlabRequestParams) {
  const {data: pipelines} = await gitlabRequest<GitlabPipelineResponse[]>(`/projects/${projectId}/pipelines`, params, gitlab)
  return pipelines.filter(pipeline => pipeline.status !== 'skipped')
}

async function fetchDownstreamJobs(projectId: number, pipelineId: number, gitlab: PartialGitlab): Promise<Stage[]> {
  const {data: gitlabBridgeJobs} = await gitlabRequest<GitlabPipelineTriggerResponse[]>(`/projects/${projectId}/pipelines/${pipelineId}/bridges`, {per_page: 100}, gitlab)
  const childPipelines = gitlabBridgeJobs.filter((bridge): bridge is GitlabPipelineTriggerResponse & {downstream_pipeline: GitlabDownstreamPipeline} =>
    bridge.downstream_pipeline !== null && bridge.downstream_pipeline.status !== 'skipped'
  )

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
  const {data: gitlabJobs} = await gitlabRequest<GitlabJobResponse[]>(`/projects/${projectId}/pipelines/${pipelineId}/jobs?include_retried=true`, {per_page: 100}, gitlab)
  if (gitlabJobs.length === 0) {
    return {commit: null, stages: []}
  }

  const commit = findCommit(gitlabJobs)

  // Map jobs and sort by id
  const mappedJobs = gitlabJobs
    .map(job => ({
      id: job.id,
      status: job.status,
      stage: job.stage,
      name: job.name,
      startedAt: job.started_at,
      finishedAt: job.finished_at,
      url: job.web_url
    } satisfies Job & {stage: string}))
    .sort((a, b) => a.id - b.id)

  // Group by stage
  const jobsByStage = new Map<string, Array<Job & {stage: string}>>()
  for (const job of mappedJobs) {
    const stageJobs = jobsByStage.get(job.stage) || []
    stageJobs.push(job)
    jobsByStage.set(job.stage, stageJobs)
  }

  // Convert to stages array
  const stages = Array.from(jobsByStage.entries()).map(([name, jobs]) => ({
    name,
    jobs: mergeRetriedJobs(removeStageProperty(jobs)).sort(byName)
  }))

  return {
    commit,
    stages
  }
}

function byName(a: Job, b: Job): number {
  return a.name.localeCompare(b.name)
}

function findCommit(jobs: GitlabJobResponse[]): Commit | null {
  const [job] = jobs.filter(j => j.commit)
  if (!job || !job.commit) {
    return null
  }
  return {
    title: job.commit.title,
    author: job.commit.author_name
  }
}

function mergeRetriedJobs(jobs: Job[]): Job[] {
  return jobs.reduce((mergedJobs: Job[], job: Job) => {
    const index = mergedJobs.findIndex(mergedJob => mergedJob.name === job.name)
    if (index >= 0) {
      mergedJobs[index] = job
    } else {
      mergedJobs.push(job)
    }
    return mergedJobs
  }, [])
}

function removeStageProperty(jobs: Array<Job & {stage: string}>): Job[] {
  return jobs.map(job => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {stage, ...rest} = job
    return rest
  })
}
