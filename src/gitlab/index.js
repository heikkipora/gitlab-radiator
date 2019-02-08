import _ from 'lodash'
import {fetchLatestPipelines} from './pipelines'
import {fetchProjects} from './projects'

export async function update(config) {
  const projects = await fetchProjects(config)
  const projectsWithPipelines = await Promise.all(projects.map(project => projectWithPipelines(project, config)))

  return projectsWithPipelines
    .filter(project => project.pipelines.length > 0)
}

async function projectWithPipelines(project, config) {
  const pipelines = filterOutEmpty(await fetchLatestPipelines(project.id, config))
  const status = masterBranchStatus(pipelines)
  return {
    ...project,
    pipelines: pipelines,
    status
  }
}

function masterBranchStatus(pipelines) {
  return _(pipelines)
    .filter({ref: 'master'})
    .map('status')
    .head()
}

function filterOutEmpty(pipelines) {
  return pipelines.filter(pipeline => pipeline.stages)
}

