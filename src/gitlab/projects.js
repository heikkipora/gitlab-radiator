import _ from 'lodash'
import {gitlabRequest} from './client'

export async function fetchProjects(gitlab) {
  const projects = await fetchProjectsPaged(gitlab)
  return _(projects)
    .flatten()
    // Ignore projects for which CI/CD is not enabled
    .filter(project => project.jobs_enabled)
    .map(projectMapper)
    .filter(includeRegexFilter(gitlab))
    .filter(excludeRegexFilter(gitlab))
    .filter(archivedFilter(gitlab))
    .value()
}

async function fetchProjectsPaged(gitlab, page = 1, projectFragments = []) {
  const {data, headers} = await gitlabRequest('/projects', {page, per_page: gitlab.perPage || 100, membership: true}, gitlab)

  projectFragments.push(data)
  const nextPage = headers['x-next-page']
  if (nextPage) {
    return fetchProjectsPaged(gitlab, Number(nextPage), projectFragments)
  }
  return projectFragments
}

function projectMapper(project) {
  return {
    id: project.id,
    name: project.path_with_namespace,
    nameWithoutNamespace: project.path,
    group: getGroupName(project),
    archived: project.archived,
    url: project.web_url
  }
}

function getGroupName(project) {
  const pathWithNameSpace = project.path_with_namespace
  return pathWithNameSpace.split('/')[0]
}

function includeRegexFilter(config) {
  return project => {
    if (config.projects && config.projects.include) {
      const includeRegex = new RegExp(config.projects.include, "i")
      return includeRegex.test(project.name)
    }
    return true
  }
}

function excludeRegexFilter(config) {
  return project => {
    if (config.projects && config.projects.exclude) {
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
