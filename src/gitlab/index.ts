import {fetchLatestPipelines} from './pipelines.ts'
import {fetchProjects} from './projects.ts'
import type {PartialProject} from './projects.ts'
import type {Pipeline, Project} from '../common/gitlab-types.d.ts'

export async function update(config: any): Promise<Project[]> {
  const projectsWithPipelines = await loadProjectsWithPipelines(config)
  return projectsWithPipelines
    .filter((project: Project) => project.pipelines.length > 0)
}

async function loadProjectsWithPipelines(config: any): Promise<Project[]> {
  const allProjectsWithPipelines: Project[] = []
  await Promise.all(config.gitlabs.map(async (gitlab: any) => {
    const projects = (await fetchProjects(gitlab))
      .map(project => ({
        ...project,
        maxNonFailedJobsVisible: gitlab.maxNonFailedJobsVisible
      }))

    for (const project of projects) {
      allProjectsWithPipelines.push(await projectWithPipelines(project, gitlab))
    }
  }))
  return allProjectsWithPipelines
}

async function projectWithPipelines(project: PartialProject, gitlab: any): Promise<Project> {
  const pipelines = filterOutEmpty(await fetchLatestPipelines(project.id, gitlab))
    .filter(excludePipelineStatusFilter(gitlab))
  const status = defaultBranchStatus(project, pipelines)
  return {
    ...project,
    maxNonFailedJobsVisible: gitlab.maxNonFailedJobsVisible,
    pipelines,
    status
  }
}

function defaultBranchStatus(project: PartialProject, pipelines: Pipeline[]) {
  const [head] = pipelines
    .filter(({ref}) => ref === project.default_branch)
    .map(({status}) => status)
  return head
}

function filterOutEmpty(pipelines: Pipeline[]): Pipeline[] {
  return pipelines.filter(pipeline => pipeline.stages)
}

function excludePipelineStatusFilter(config: any): (pipeline: Pipeline) => boolean {
  return (pipeline: Pipeline) => {
    if (config.projects && config.projects.excludePipelineStatus) {
      return !config.projects.excludePipelineStatus.includes(pipeline.status)
    }
    return true
  }
}
