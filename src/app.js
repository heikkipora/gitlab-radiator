const http = require('http')
const socketIo = require('socket.io')
const express = require('express')
const compression = require('compression')
const browserify = require('browserify-middleware')
const lessMiddleware = require('less-middleware')

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
