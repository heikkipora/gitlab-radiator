import {gitlabRequest} from './client.ts'
import type {Gitlab, GitlabRunnerStatus} from '../config.ts'

export async function fetchOfflineRunners(gitlab: Gitlab): Promise<{offline: {name: string, status: GitlabRunnerStatus}[], totalCount: number}> {
  const runners = await fetchRunners(gitlab)
  const offline = runners.filter((r: any) => r.status === 'offline')
  return {
    offline,
    totalCount: runners.length
  }
}

async function fetchRunners(gitlab: Gitlab) {
  const {data: runners} = await gitlabRequest('/runners', null, gitlab)
  return runners.map((r: any) => ({
    name: r.description || r.id,
    status: r.status as GitlabRunnerStatus
  }))
}
