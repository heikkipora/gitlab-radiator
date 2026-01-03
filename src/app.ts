import {basicAuth} from './auth.ts'
import compression from 'compression'
import {config} from './config.ts'
import express from 'express'
import fs from 'fs'
import {fetchOfflineRunners} from './gitlab/runners.ts'
import http from 'http'
import {serveLessAsCss} from './less.ts'
import {Server} from 'socket.io'
import {update} from './gitlab/index.ts'
import type {GlobalState} from './common/gitlab-types.d.ts'

const app = express()
const httpServer = new http.Server(app)
const socketIoServer = new Server(httpServer)

if (process.env.NODE_ENV !== 'production' && fs.existsSync('./src/dev-assets.ts')) {
  const {bindDevAssets} = await import('./dev-assets.ts')
  bindDevAssets(app)
}

app.disable('x-powered-by')
app.get('/client.css', serveLessAsCss)
app.use(express.static('public'))
app.use(compression())
app.use(basicAuth(config.auth))

httpServer.listen(config.port, () => {
  console.log(`Listening on port *:${config.port}`)
})

const globalState: Omit<GlobalState, 'now'> = {
  projects: null,
  error: null,
  zoom: config.zoom,
  projectsOrder: config.projectsOrder,
  columns: config.columns,
  horizontal: config.horizontal,
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
  } catch (error: any) {
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
  }, {offline: [], totalCount: 0 as number})

  if (offline.length > 0) {
    const names = offline.map(r => r.name).sort().join(', ')
    const counts = offline.length === totalCount ? 'All' : `${offline.length}/${totalCount}`
    return `${counts} runners offline: ${names}`
  }
  return null
}

await runUpdate()

function withDate(state: Omit<GlobalState, 'now'>): GlobalState {
  return {
    ...state,
    now: Date.now()
  }
}
