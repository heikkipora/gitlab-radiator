const common = require('./webpack.common.cjs')
const {merge} = require('webpack-merge')
const webpack = require('webpack')

module.exports = merge(common, {
  mode: 'development',
  entry: [
    './src/client/index.tsx',
    'webpack-hot-middleware/client'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(ttf|html)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devtool: 'inline-source-map'
})