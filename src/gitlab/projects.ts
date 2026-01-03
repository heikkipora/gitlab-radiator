import {gitlabRequest} from './client.ts'
import type {Gitlab} from '../config.ts'
import type {Project} from '../common/gitlab-types.d.ts'

export type PartialProject = Omit<Project, 'pipelines' | 'maxNonFailedJobsVisible' | 'status'>

interface GitlabProjectResponse {
  id: number
  path: string
  path_with_namespace: string
  archived: boolean
  default_branch: string | null
  web_url: string
  tag_list?: string[]
  jobs_enabled: boolean
}

export async function fetchProjects(gitlab: Gitlab): Promise<PartialProject[]> {
  const projects = await fetchOwnProjects(gitlab)
  return projects
    // Ignore projects for which CI/CD is not enabled
    .filter(project => project.jobs_enabled)
    .map(projectMapper)
    .filter(includeRegexFilter(gitlab))
    .filter(excludeRegexFilter(gitlab))
    .filter(archivedFilter(gitlab))
}

async function fetchOwnProjects(gitlab: Gitlab) {
  const projects: GitlabProjectResponse[] = []
  const SAFETY_MAX_PAGE = 10
  for (let page = 1; page <= SAFETY_MAX_PAGE; page += 1) {
    const {data, headers} = await gitlabRequest<GitlabProjectResponse[]>('/projects', {page, per_page: 100, membership: true}, gitlab)
    projects.push(...data)
    if (data.length === 0 || !headers['x-next-page']) {
      break
    }
  }
  return projects
}

function projectMapper(project: GitlabProjectResponse): PartialProject {
  return {
    id: project.id,
    name: project.path_with_namespace,
    nameWithoutNamespace: project.path,
    group: getGroupName(project),
    archived: project.archived,
    default_branch: project.default_branch || 'master',
    url: project.web_url,
    tags: (project.tag_list || []).map((t: string) => t.toLowerCase())
  }
}

function getGroupName(project: GitlabProjectResponse) {
  const pathWithNameSpace = project.path_with_namespace
  return pathWithNameSpace.split('/')[0]
}

function includeRegexFilter(gitlab: Gitlab) {
  return (project: PartialProject) => {
    if (gitlab.projects?.include) {
      const includeRegex = new RegExp(gitlab.projects.include, "i")
      return includeRegex.test(project.name)
    }
    return true
  }
}

function excludeRegexFilter(gitlab: Gitlab) {
  return (project: PartialProject) => {
    if (gitlab.projects?.exclude) {
      const excludeRegex = new RegExp(gitlab.projects.exclude, "i")
      return !excludeRegex.test(project.name)
    }
    return true
  }
}

function archivedFilter(gitlab: Gitlab) {
  return (project: PartialProject) => {
    if (gitlab.ignoreArchived) {
      return !project.archived
    }
    return true
  }
}
