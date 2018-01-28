const assert = require('assert')
const fs = require('fs')
const os = require('os')
const yaml = require('js-yaml')

const configFile = expandTilde(process.env.GITLAB_RADIATOR_CONFIG || '~/.gitlab-radiator.yml')
const yamlContent = fs.readFileSync(configFile, 'utf8')
const config = validate(yaml.safeLoad(yamlContent))

config.interval = config.interval || {}
config.interval.projects = Number(config.interval.projects || 120) * 1000
config.interval.builds = Number(config.interval.builds || 10) * 1000
config.port = Number(config.port || 3000)
config.zoom = Number(config.zoom || 1.0)
config.ca = config.caFile && fs.existsSync(config.caFile, 'utf-8') ? fs.readFileSync(config.caFile) : undefined

function expandTilde(path) {
  return path.replace(/^~($|\/|\\)/, `${os.homedir()}$1`)
}

function validate(cfg) {
  assert.ok(cfg.gitlab, 'Mandatory gitlab properties missing from configuration file')
  assert.ok(cfg.gitlab.url, 'Mandatory gitlab url missing from configuration file')
  assert.ok(cfg.gitlab['access-token'], 'Mandatory gitlab access token missing from configuration file')
  return cfg
}

module.exports = config
