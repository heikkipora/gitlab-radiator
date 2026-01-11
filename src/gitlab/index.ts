import {fetchLatestPipelines} from './pipelines.ts'
import {fetchProjects} from './projects.ts'
import type {Gitlab} from '../config.ts'
import type {PartialProject} from './projects.ts'
import type {Pipeline, Project} from '../common/gitlab-types.d.ts'

export async function update(gitlabs: Gitlab[], prioritizeRunningPipelines: boolean): Promise<Project[]> {
  const projectsWithPipelines = await loadProjectsWithPipelines(gitlabs, prioritizeRunningPipelines)
  return projectsWithPipelines
    .filter((project: Project) => project.pipelines.length > 0)
}

async function loadProjectsWithPipelines(gitlabs: Gitlab[], prioritizeRunningPipelines: boolean): Promise<Project[]> {
  const allProjectsWithPipelines: Project[] = []
  await Promise.all(gitlabs.map(async gitlab => {
    const projects = (await fetchProjects(gitlab))
      .map(project => ({
        ...project,
        maxNonFailedJobsVisible: gitlab.maxNonFailedJobsVisible
      }))

    for (const project of projects) {
      allProjectsWithPipelines.push(await projectWithPipelines(project, gitlab, prioritizeRunningPipelines))
    }
  }))
  return allProjectsWithPipelines
}

async function projectWithPipelines(project: PartialProject, gitlab: Gitlab, prioritizeRunningPipelines: boolean): Promise<Project> {
  const pipelines = filterOutEmpty(await fetchLatestPipelines(project.id, gitlab, prioritizeRunningPipelines))
    .filter(excludePipelineStatusFilter(gitlab))
  const status = defaultBranchStatus(project, pipelines)
  return {
    ...project,
    maxNonFailedJobsVisible: gitlab.maxNonFailedJobsVisible,
    commitAsTitle: gitlab.commitAsTitle,
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

function excludePipelineStatusFilter(gitlab: Gitlab): (pipeline: Pipeline) => boolean {
  return (pipeline: Pipeline) => {
    if (gitlab.projects?.excludePipelineStatus) {
      return !gitlab.projects.excludePipelineStatus.includes(pipeline.status)
    }
    return true
  }
}
