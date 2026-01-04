export type ProjectsOrder = 'status' | 'name' | 'id' | 'nameWithoutNamespace' | 'group'

export interface GlobalState {
  columns: number
  error: string | null
  groupSuccessfulProjects: boolean
  horizontal: boolean
  projects: Project[] | null
  projectsOrder: Array<ProjectsOrder>
  zoom: number
  now: number
}

export interface Project {
  archived: boolean
  group: string
  id: number
  name: string
  nameWithoutNamespace: string
  tags: string[]
  url: string
  default_branch: string
  pipelines: Pipeline[]
  maxNonFailedJobsVisible: number
  status: JobStatus
}

export interface Pipeline {
  commit: Commit | null
  id: number
  ref: string
  stages: Stage[]
  status: JobStatus
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
  startedAt: string | null
  status: JobStatus
  url: string
}

export type JobStatus = 'canceled' | 'created' | 'failed' | 'manual' | 'pending' | 'running' | 'skipped' | 'success'
