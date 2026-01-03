import axios from 'axios'
import https from 'https'
import url from 'url'
import type {Gitlab} from '../config'

export type PartialGitlab = Pick<Gitlab, 'url' | 'access-token' | 'ca'>

export interface GitlabRequestParams {
  page?: number
  per_page?: number
  membership?: boolean
  ref?: string
}

export function gitlabRequest(pathStr: string, params: GitlabRequestParams | null, gitlab: PartialGitlab) {
  return lazyClient(gitlab).get(pathStr, {params: params || {}})
}

const clients = new Map<string, any>()

function lazyClient(gitlab: PartialGitlab) {
  const gitlabUrl = gitlab.url
  if (gitlabUrl === undefined) {
    console.log('Got undefined url for ' + JSON.stringify(gitlab))
  }
  if (!clients.get(gitlabUrl)) {
    const client = axios.create({
        baseURL: url.resolve(gitlabUrl, '/api/v4/'),
        headers: {'PRIVATE-TOKEN': gitlab['access-token']},
        httpsAgent: new https.Agent({keepAlive: true, ca: gitlab.ca}),
        timeout: 30 * 1000
      })
    clients.set(gitlabUrl, client)
  }
  return clients.get(gitlabUrl)
}
