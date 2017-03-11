const http = require('http')
const socketIo = require('socket.io')
const express = require('express')
const compression = require('compression')
const browserify = require('browserify-middleware')
const lessMiddleware = require('less-middleware')
const os = require('os')
const path = require('path')

const config = require('./config')
const gitlabBuildsStream = require('./gitlab')

const app = express()
const httpServer = http.Server(app)
const socketIoServer = socketIo(httpServer)

app.disable('x-powered-by')
app.use(compression())

const cacheDir = path.join(os.tmpDir(), 'gitlab-radiator-css-cache');
app.use(lessMiddleware(`${__dirname}/../public`,
  {
    postprocess: {
      css: generateZoomCss
    },
    dest: cacheDir
  }
))
app.use(express.static(cacheDir));
app.use(express.static(`${__dirname}/../public`))

app.get('/js/client.js', browserify(__dirname + '/client/index.js'))

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

gitlabBuildsStream.onValue(builds => {
  globalState.builds = builds
  globalState.error = undefined
  socketIoServer.emit('state', globalState)
})

gitlabBuildsStream.onError(error => {
  globalState.error = error
  socketIoServer.emit('state', globalState)
})

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
