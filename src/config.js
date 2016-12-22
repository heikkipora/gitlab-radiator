const fs = require('fs')
const os = require('os')
const yaml = require('js-yaml')

const CONFIG_FILE = process.env.GITLAB_RADIATOR_CONFIG || '~/.gitlab-radiator.yml'

function expandTilde(path) {
  return path.replace(/^~($|\/|\\)/, `${os.homedir()}$1`)
}

function loadConfig() {
  try {
    return yaml.safeLoad(fs.readFileSync(expandTilde(CONFIG_FILE), 'utf8'));
  } catch (err) {
    console.error(`Failed to load config file: ${err.message}`)
    process.exit(1)
  }
}

module.exports = loadConfig
