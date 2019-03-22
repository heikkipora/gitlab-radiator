import browserify from 'browserify-middleware'
import path from 'path'

export function bindDevAssets(app) {
  app.get('/client.js', browserify(path.join(__dirname, '/client/index.js')))
}
