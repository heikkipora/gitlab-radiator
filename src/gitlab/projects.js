import _ from 'lodash'
import {gitlabRequest} from './client'

export async function fetchProjects(config) {
  const projects = await fetchProjectsPaged(config)
  return _(projects)
    .flatten()
    .map(takeProjectIdAndNameAndArchived)
    .filter(regexFilter(config))
    .filter(archivedFilter(config))
    .value()
}

async function fetchProjectsPaged(config, page = 1, projectFragments = []) {
  const {data, headers} = await gitlabRequest('/projects', {page, per_page: config.perPage || 100, membership: true}, config)
  projectFragments.push(data)
  const nextPage = headers['x-next-page']
  if (nextPage) {
    return fetchProjectsPaged(config, Number(nextPage), projectFragments)
  }
  return projectFragments
}

function takeProjectIdAndNameAndArchived(project) {
  return {
    id: project.id,
    name: project.path_with_namespace,
    archived: project.archived
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

function archivedFilter(config) {
  return project => {
    if (config.ignoreArchived) {
      return !project.archived
    }
    return true
  }
}
