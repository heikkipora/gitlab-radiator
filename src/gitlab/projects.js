import _ from 'lodash'
import {gitlabRequest} from './client'

export async function fetchProjects(config) {
  const projects = await fetchProjectsPaged(config)
  return _(projects)
    .flatten()
    .map(takeProjectIdAndName)
    .filter(regexFilter(config))
    .value()
}

async function fetchProjectsPaged(config, page = 1, projectFragments = []) {
  const {body, headers} = await gitlabRequest('/api/v4/projects', {page, per_page: config.perPage || 100, membership: true}, config)
  projectFragments.push(body)
  const nextPage = headers['x-next-page']
  if (nextPage) {
    return fetchProjectsPaged(config, Number(nextPage), projectFragments)
  }
  return projectFragments
}

function takeProjectIdAndName(project) {
  return {
    id: project.id,
    name: project.path_with_namespace
  }
}

function regexFilter(config) {
  return project => {
    if (config.projects && config.projects.include) {
      const includeRegex = new RegExp(config.projects.include, "i")
      return includeRegex.test(project.name)
    } else if (config.projects && config.projects.exclude) {
      const excludeRegex = new RegExp(config.projects.exclude, "i")
      return !excludeRegex.test(project.name)
    }
    return true
  }
}
