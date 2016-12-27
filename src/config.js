const assert = require('assert')
const Bacon = require('baconjs')
const fs = require('fs')
const os = require('os')
const yaml = require('js-yaml')

const CONFIG_FILE = expandTilde(process.env.GITLAB_RADIATOR_CONFIG || '~/.gitlab-radiator.yml')
const CONFIG_POLL_INTERVAL_SEC = process.env.GITLAB_RADIATOR_CONFIG_POLL_INTERVAL_SEC || 120

function pollConfig(interval) {
  return Bacon.later(0, true)
    .merge(Bacon.interval(CONFIG_POLL_INTERVAL_SEC * 1000, true))
    .map(CONFIG_FILE)
    .flatMap(loadConfig)
    .doAction(validate)
}

function loadConfig(configFile) {
  return Bacon.fromNodeCallback(fs.readFile, configFile, 'utf8')
    .map(yaml.safeLoad)
    .skipDuplicates()
}

function expandTilde(path) {
  return path.replace(/^~($|\/|\\)/, `${os.homedir()}$1`)
}

function validate(config) {
  assert.ok(config.gitlab, 'Mandatory gitlab properties missing from configuration file')
  assert.ok(config.gitlab.url, 'Mandatory gitlab url missing from configuration file')
  assert.ok(config.gitlab['access-token'], 'Mandatory gitlab access token missing from configuration file')
}

module.exports = pollConfig
