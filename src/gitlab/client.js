const request = require('request-promise')
const url = require('url')

export function gitlabRequest(path, qs, config, resolveWithFullResponse = true) {
  const options = {
    ca: config.ca,
    headers: {'PRIVATE-TOKEN': config.gitlab['access-token']},
    json: true,
    resolveWithFullResponse,
    qs,
    url: url.resolve(config.gitlab.url, path)
  }
  return request(options)
}
