import browserify from 'browserify-middleware'
import compression from 'compression'
import {config} from './config'
import express from 'express'
import {update} from './gitlab'
import http from 'http'
import lessMiddleware from 'less-middleware'
import os from 'os'
import path from 'path'
import socketIo from 'socket.io'

const app = express()
const httpServer = http.Server(app)
const socketIoServer = socketIo(httpServer)

app.disable('x-powered-by')
app.use(compression())

const cacheDir = path.join(os.tmpdir(), 'gitlab-radiator-css-cache');
app.use(lessMiddleware(`${__dirname}/../public`,
  {
    postprocess: {
      css: generateZoomCss
    },
    dest: cacheDir
  }
))
app.use(express.static(cacheDir))
app.use(express.static(`${__dirname}/../public`))

app.get('/js/client.js', browserify(path.join(__dirname, '/client/index.js')))

httpServer.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port *:${config.port}`)
})

const globalState = {
  builds: undefined,
  error: undefined
}

socketIoServer.on('connection', (socket) => {
  socket.emit('state', globalState)
})

setInterval(async () => {
  try {
    globalState.builds = await update(config)
    globalState.error = undefined
    socketIoServer.emit('state', globalState)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    globalState.error = error
    socketIoServer.emit('state', globalState)
  }
}, config.interval)

function generateZoomCss(css) {
  const widthPercentage = Math.round(100 / config.zoom)
  return `
    ${css}

    ol.projects {
      transform: scale(${config.zoom});
      width: ${widthPercentage}%;
    }
    `
}
