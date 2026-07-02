const common = require('./webpack.common.cjs')
const {merge} = require('webpack-merge')

module.exports = merge(common, {
  mode: 'production',
  entry: [
    './src/client/index.tsx'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: 'ts-loader'
      },
      {
        test: /\.(ttf|html)$/i,
        type: 'asset/resource'
      }
    ]
  }
})
