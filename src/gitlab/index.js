import _ from 'lodash'
import {fetchLatestPipelines} from './pipelines'
import {fetchProjects} from './projects'

export async function update(config) {
  const projects = await fetchProjects(config)
  const projectsWithPipelines = await Promise.all(projects.map(project => projectWithPipelines(project, config)))
  return projectsWithPipelines.filter(project => project.pipelines.length > 0)
}

async function projectWithPipelines({id, name}, config) {
  const pipelines = await fetchLatestPipelines(id, config)
  const status = masterBranchStatus(pipelines)
  return {
    id,
    name,
    pipelines,
    status
  }
}

function masterBranchStatus(pipelines) {
  return _(pipelines)
    .filter({ref: 'master'})
    .map('status')
    .head()
}
