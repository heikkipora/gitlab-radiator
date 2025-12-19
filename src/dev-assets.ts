import config from '../webpack.dev.cjs'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'

export function bindDevAssets(app: any) {
  const compiler = webpack(config)
  app.use(webpackDevMiddleware(compiler))
  app.use(webpackHotMiddleware(compiler))
}
