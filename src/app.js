import {basicAuth} from './auth'
import compression from 'compression'
import {config} from './config'
import express from 'express'
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

setInterval(async () => {
  try {
    globalState.projects = await update(config)
    globalState.error = null
    socketIoServer.emit('state', withDate(globalState))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error.message)
    globalState.error = `Failed to communicate with GitLab API: ${error.message}`
    socketIoServer.emit('state', withDate(globalState))
  }
}, config.interval)

function withDate(state) {
  return {
    ...state,
    now: Date.now()
  }
}

const signals = {
  'SIGINT': 2,
  'SIGTERM': 15
}

function shutdown(signal, value) {
  httpServer.close(() => {
    // eslint-disable-next-line no-console
    console.log(`Server stopped by ${signal}.`)
    // eslint-disable-next-line no-process-exit
    process.exit(128 + value)
  })
}

Object.keys(signals).forEach((signal) => {
  process.on(signal, () => shutdown(signal, signals[signal]))
})
