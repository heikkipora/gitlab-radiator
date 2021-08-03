const common = require('./webpack.common.js')
const {merge} = require('webpack-merge')

module.exports = merge(common, {
  mode: 'production',
  entry: [
    './src/client/index.tsx'
  ]
})
