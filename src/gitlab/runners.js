import {gitlabRequest} from './client'

export async function fetchOfflineRunners(gitlab) {
  const runners = await fetchRunners(gitlab)
  const offline = runners.filter(r => r.status === 'offline')
  return {
    offline,
    totalCount: runners.length
  }
}

async function fetchRunners(gitlab) {
  const {data: runners} = await gitlabRequest('/runners', {}, gitlab)
  return runners.map(r => ({
    name: r.description || r.id,
    status: r.status
  }))
}
