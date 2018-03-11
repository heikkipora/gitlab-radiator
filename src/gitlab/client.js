import axios from 'axios'
import https from 'https'
import url from 'url'

export function gitlabRequest(path, params, config) { 
  return lazyClient(config).get(path, {params})
}

let client = null

function lazyClient(config) {
  if (!client) {
    client = axios.create({
      baseURL: url.resolve(config.gitlab.url, '/api/v4/'),
      headers: {'PRIVATE-TOKEN': config.gitlab['access-token']},
      httpsAgent: new https.Agent({keepAlive: true, ca: config.ca}),
      timeout: 30 * 1000
    })
  }
  return client
}
