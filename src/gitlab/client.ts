import axios from 'axios'
import https from 'https'
import url from 'url'

export function gitlabRequest(pathStr: string, params: any, gitlab: any) {
  return lazyClient(gitlab).get(pathStr, {params})
}

const clients = new Map<string, any>()

function lazyClient(gitlab: any) {
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
