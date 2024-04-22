
export interface GlobalState {
  columns: number
  error: string | null
  groupSuccessfulProjects: boolean
  rotateRunningPipelines: boolean
  horizontal: boolean
  projects: Project[] | null
  projectsOrder: string[]
  zoom: number
  now: number
}

export interface Project {
  archived: false
  group: string
  id: number
  name: string
  nameWithoutNamespace: string
  tags: string[]
  url: string
  default_branch: string
  pipelines: Pipeline[]
  maxNonFailedJobsVisible: number
  rotateRunningPipelines: boolean
  status: 'success' | 'failed'
}

export interface Pipeline {
  commit: Commit | null
  id: number
  ref: string
  stages: Stage[]
  status: 'success' | 'failed'
  running: boolean
}

export interface Commit {
  title: string
  author: string
}

export interface Stage {
  jobs: Job[]
  name: string
}

export interface Job {
  finishedAt: string | null
  id: number
  name: string
  stage: string
  startedAt: string | null
  status: JobStatus
  url: string
}

export type JobStatus = 'created' | 'failed' | 'manual' | 'pending' | 'running' | 'skipped' | 'success'
