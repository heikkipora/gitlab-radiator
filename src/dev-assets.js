import browserify from 'browserify-middleware'
import express from 'express'
import lessMiddleware from 'less-middleware'
import os from 'os'
import path from 'path'

export function bindDevAssets(app) {
  const cacheDir = path.join(os.tmpdir(), 'gitlab-radiator-css-cache');
  app.use(lessMiddleware(`${__dirname}/../public`, {dest: cacheDir}))
  app.use(express.static(cacheDir))
  app.get('/client.js', browserify(path.join(__dirname, '/client/index.js')))
}
