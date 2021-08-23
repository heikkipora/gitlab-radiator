import {basicAuth} from './auth'
import compression from 'compression'
import {config} from './config'
import express from 'express'
import {fetchOfflineRunners} from './gitlab/runners'
import http from 'http'
import lessMiddleware from 'less-middleware'
import os from 'os'
import path from 'path'
import socketIo from 'socket.io'
import {update} from './gitlab'

const cacheDir = path.join(os.tmpdir(), 'gitlab-radiator-css-cache')

const app = express()
const httpServer = http.Server(app)
const socketIoServer = socketIo(httpServer)

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const {bindDevAssets} = require('./dev-assets')
  bindDevAssets(app)
}

app.disable('x-powered-by')
app.use(lessMiddleware(`${__dirname}/../public`, {
    dest: cacheDir,
    preprocess: {
      less: (src) => {
        let colorLess = ''
        Object.keys(config.colors).forEach((stateName) => {
          colorLess += `@${stateName}-color:${config.colors[stateName]};`
        })
        return src + colorLess
      }
    }
  }
))
app.use(express.static(cacheDir))
app.use(express.static(`${__dirname}/../public`))
app.use(compression())
app.use(basicAuth(config.auth))

httpServer.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port *:${config.port}`)
})

const globalState = {
  projects: null,
  error: null,
  zoom: config.zoom,
  projectsOrder: config.projectsOrder,
  columns: config.columns,
  groupSuccessfulProjects: config.groupSuccessfulProjects
}

socketIoServer.on('connection', (socket) => {
  socket.emit('state', withDate(globalState))
})

async function runUpdate() {
  try {
    globalState.projects = await update(config)
    globalState.error = await errorIfRunnerOffline()
    socketIoServer.emit('state', withDate(globalState))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message)
    globalState.error = `Failed to communicate with GitLab API: ${error.message}`
    socketIoServer.emit('state', withDate(globalState))
  }
  setTimeout(runUpdate, config.interval)
}

async function errorIfRunnerOffline() {
  const offlineRunnersPerGitlab = await Promise.all(config.gitlabs.map(fetchOfflineRunners))
  const {offline, totalCount} = offlineRunnersPerGitlab.reduce((acc, runner) => {
    return {
      offline: acc.offline.concat(runner.offline),
      totalCount: acc.totalCount + runner.totalCount
    }
  }, {offline: [], totalCount: 0})

  if (offline.length > 0) {
    const names = offline.map(r => r.name).sort().join(', ')
    const counts = offline.length === totalCount ? 'All' : `${offline.length}/${totalCount}`
    return `${counts} runners offline: ${names}`
  }
  return null
}

runUpdate()

function withDate(state) {
  return {
    ...state,
    now: Date.now()
  }
}
