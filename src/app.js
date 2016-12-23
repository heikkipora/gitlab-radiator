const _ = require('lodash')
const Bacon = require('baconjs')
const http = require('http')
const socketIo = require('socket.io')
const express = require('express')
const compression = require('compression')
const browserify = require('browserify-middleware')
const lessMiddleware = require('less-middleware')
const pollConfig = require('./config')
const {fetchBuilds, fetchProjects} = require('./gitlab')

const app = express()
const httpServer = http.Server(app)
const socketIoServer = socketIo(httpServer)
startFetchingBuildsFromGitlab(socketIoServer)

app.disable('x-powered-by')
app.use(compression())
app.use(lessMiddleware(`${__dirname}/../public`))
app.use(express.static(`${__dirname}/../public`))

app.get('/js/client.js', browserify(__dirname + '/client/index.js'))

let cachedBuilds = []
socketIoServer.on('connection', (socket) => {
  socket.emit('builds', cachedBuilds)
})

const port = process.env.PORT || 3000
httpServer.listen(port, () => {
  console.log(`Listening on port *:${port}`)
})

function startFetchingBuildsFromGitlab(socketIo) {
  const projectsStream = pollConfig().flatMap(config => {
      const projects = fetchProjects(config.gitlab).map(projects => {
        if (config.projects) {
          return _.filter(projects, project => _.includes(config.projects, project.name))
        }
        return projects
      })

      return Bacon.combineTemplate({
        config: config,
        projects: projects
      })
    })

    projectsStream.onError(error => {
      console.error(error)
    })
    const projectsProperty = projectsStream.toProperty()

  const BUILDS_POLL_INTERVAL_SEC = process.env.GITLAB_RADIATOR_BUILDS_POLL_INTERVAL_SEC || 10

  Bacon.interval(BUILDS_POLL_INTERVAL_SEC * 1000, true)
    .merge(Bacon.later(0, true))
    .map(projectsProperty)
    .flatMap(configAndProjects => {
      return Bacon.fromArray(configAndProjects.projects)
        .flatMap(fetchBuilds(configAndProjects.config.gitlab))
        .fold([], (acc, item) => {
          acc.push(item)
          return acc
        })
        .map(builds => {
          return _.sortBy(builds, build => {
            return build.project.name
          })
        })
    })
    .onValue(builds => {
      cachedBuilds = builds
      socketIo.emit('builds', builds)
    })
}
