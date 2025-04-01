import {gitlabRequest} from './client.js'

export async function fetchProjects(gitlab) {
  const projects = await fetchOwnProjects(gitlab)
  return projects
    // Ignore projects for which CI/CD is not enabled
    .filter(project => project.jobs_enabled)
    .map(projectMapper)
    .filter(includeRegexFilter(gitlab))
    .filter(excludeRegexFilter(gitlab))
    .filter(archivedFilter(gitlab))
}

async function fetchOwnProjects(gitlab) {
  const projects = []
  const SAFETY_MAX_PAGE = 10
  for (let page = 1; page <= SAFETY_MAX_PAGE; page += 1) {
     
    const {data, headers} = await gitlabRequest('/projects', {page, per_page: 100, membership: true}, gitlab)
    projects.push(data)
    if (data.length === 0 || !headers['x-next-page']) {
      break
    }
  }
  return projects.flat()
}

function projectMapper(project) {
  return {
    id: project.id,
    name: project.path_with_namespace,
    nameWithoutNamespace: project.path,
    group: getGroupName(project),
    archived: project.archived,
    default_branch: project.default_branch || 'master',
    url: project.web_url,
    tags: (project.tag_list || []).map(t => t.toLowerCase())
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
