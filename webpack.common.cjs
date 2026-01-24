const path = require('path')
const webpack = require('webpack')

module.exports = {
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'build/public')
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  }
}
