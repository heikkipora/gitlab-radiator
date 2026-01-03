import {gitlabRequest} from './client.ts'

export async function fetchOfflineRunners(gitlab: any) {
  const runners = await fetchRunners(gitlab)
  const offline = runners.filter((r: any) => r.status === 'offline')
  return {
    offline,
    totalCount: runners.length
  }
}

async function fetchRunners(gitlab: any) {
  const {data: runners} = await gitlabRequest('/runners', {}, gitlab)
  return runners.map((r: any) => ({
    name: r.description || r.id,
    status: r.status
  }))
}
