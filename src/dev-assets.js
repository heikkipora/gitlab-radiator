import config from '../webpack.config'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

export function bindDevAssets(app) {
  const compiler = webpack({...config, mode: 'development'})
  const {publicPath} = config.output
  app.use(webpackDevMiddleware(compiler, {publicPath}))
  app.use(webpackHotMiddleware(compiler, {publicPath}))
}
