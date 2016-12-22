const _ = require('lodash')
const Bacon = require('baconjs')
const http = require('http')
const socketIo = require('socket.io')
const express = require('express')
const compression = require('compression')
const browserify = require('browserify-middleware')
const lessMiddleware = require('less-middleware')
const loadConfig = require('./config')
const {fetchBuilds, fetchProjects} = require('./gitlab')

const config = loadConfig()
const projectsProperty = fetchProjects(config.gitlab)
  .map(projects => {
    return _.filter(projects, project => _.includes(config.projects, project.name))
  })
  .toProperty()

projectsProperty
  .flatMap(Bacon.fromArray)
  .flatMap(fetchBuilds(config.gitlab))
  .log()

const app = express()
const httpServer = http.Server(app)
const socketIoServer = socketIo(httpServer)

app.disable('x-powered-by')
app.use(compression())
app.use(lessMiddleware(`${__dirname}/../public`))
app.use(express.static(`${__dirname}/../public`))

app.get('/js/client.js', browserify(__dirname + '/client/index.js'))

socketIoServer.on('connection', (socket) => {
})

const port = process.env.PORT || 3000
httpServer.listen(port, () => {
  console.log(`Listening on port *:${port}`)
})
