const Bacon = require('baconjs')
const fs = require('fs')
const os = require('os')
const yaml = require('js-yaml')

const CONFIG_FILE = expandTilde(process.env.GITLAB_RADIATOR_CONFIG || '~/.gitlab-radiator.yml')
const CONFIG_POLL_INTERVAL_SEC = process.env.GITLAB_RADIATOR_CONFIG_POLL_INTERVAL_SEC || 60

function expandTilde(path) {
  return path.replace(/^~($|\/|\\)/, `${os.homedir()}$1`)
}

function loadConfig(configFile) {
  return Bacon.fromNodeCallback(fs.readFile, configFile, 'utf8')
    .map(yaml.safeLoad)
}

function pollConfig(interval) {
  return Bacon.interval(CONFIG_POLL_INTERVAL_SEC * 1000, CONFIG_FILE)
    .merge(Bacon.later(0, CONFIG_FILE))
    .flatMap(loadConfig)
}

module.exports = pollConfig
