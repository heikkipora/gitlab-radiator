import compression from 'compression'
import {config} from './config'
import express from 'express'
import {update} from './gitlab'
import http from 'http'
import socketIo from 'socket.io'

const app = express()
const httpServer = http.Server(app)
const socketIoServer = socketIo(httpServer)

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line global-require
  const {bindDevAssets} = require('./dev-assets')
  bindDevAssets(app)
}

app.disable('x-powered-by')
app.use(compression())
app.use(express.static(`${__dirname}/../public`))

httpServer.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port *:${config.port}`)
})

const globalState = {
  projects: undefined,
  error: undefined,
  zoom: config.zoom
}

socketIoServer.on('connection', (socket) => {
  socket.emit('state', withDate(globalState))
})

setInterval(async () => {
  try {
    globalState.projects = await update(config)
    globalState.error = undefined
    socketIoServer.emit('state', withDate(globalState))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    globalState.error = error
    socketIoServer.emit('state', withDate(globalState))
  }
}, config.interval)

function withDate(state) {
  return {
    ...state,
    now: Date.now()
  }
}
