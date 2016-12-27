const _ = require('lodash')
const Bacon = require('baconjs')
const http = require('http')
const socketIo = require('socket.io')
const express = require('express')
const compression = require('compression')
const browserify = require('browserify-middleware')
const lessMiddleware = require('less-middleware')

const config = require('./config')
const gitlabBuildsStream = require('./gitlab')

const app = express()
const httpServer = http.Server(app)
const socketIoServer = socketIo(httpServer)

app.disable('x-powered-by')
app.use(compression())
app.use(lessMiddleware(`${__dirname}/../public`))
app.use(express.static(`${__dirname}/../public`))

app.get('/js/client.js', browserify(__dirname + '/client/index.js'))

httpServer.listen(config.port, () => {
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
