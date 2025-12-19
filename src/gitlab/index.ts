import {fetchLatestPipelines} from './pipelines.ts'
import {fetchProjects} from './projects.ts'

export async function update(config: any) {
  const projectsWithPipelines = await loadProjectsWithPipelines(config)
  return projectsWithPipelines
    .filter((project: any) => project.pipelines.length > 0)
}

async function loadProjectsWithPipelines(config: any) {
  const allProjectsWithPipelines: any[] = []
  await Promise.all(config.gitlabs.map(async (gitlab: any) => {
    const projects = (await fetchProjects(gitlab))
      .map((project: any) => ({
        ...project,
        maxNonFailedJobsVisible: gitlab.maxNonFailedJobsVisible
      }))

    for (const project of projects) {
      allProjectsWithPipelines.push(await projectWithPipelines(project, gitlab))
    }
  }))
  return allProjectsWithPipelines
}

async function projectWithPipelines(project: any, config: any) {
  const pipelines = filterOutEmpty(await fetchLatestPipelines(project.id, config))
    .filter(excludePipelineStatusFilter(config))
  const status = defaultBranchStatus(project, pipelines)
  return {
    ...project,
    pipelines,
    status
  }
}

function defaultBranchStatus(project: any, pipelines: any[]) {
  const [head] = pipelines
    .filter(({ref}) => ref === project.default_branch)
    .map(({status}) => status)
  return head
}

function filterOutEmpty(pipelines: any[]) {
  return pipelines.filter(pipeline => pipeline.stages)
}

function excludePipelineStatusFilter(config: any) {
  return (pipeline: any) => {
    if (config.projects && config.projects.excludePipelineStatus) {
      return !config.projects.excludePipelineStatus.includes(pipeline.status)
    }
    return true
  }
}
