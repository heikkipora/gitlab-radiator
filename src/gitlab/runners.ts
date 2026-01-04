import {gitlabRequest} from './client.ts'
import type {Gitlab} from '../config.ts'

type RunnerStatus = 'online' | 'offline' | 'stale' | 'never_contacted'

export async function fetchOfflineRunners(gitlab: Gitlab): Promise<{offline: {name: string, status: RunnerStatus}[], totalCount: number}> {
  const runners = await fetchRunners(gitlab)
  const offline = runners.filter(r => r.status === 'offline')
  return {
    offline,
    totalCount: runners.length
  }
}

interface GitlabRunnerResponse {
  id: number
  description?: string
  status: RunnerStatus
}

async function fetchRunners(gitlab: Gitlab) {
  const {data: runners} = await gitlabRequest<GitlabRunnerResponse[]>('/runners', null, gitlab)
  return runners.map(r => ({
    name: r.description || r.id.toString(),
    status: r.status
  }))
}
