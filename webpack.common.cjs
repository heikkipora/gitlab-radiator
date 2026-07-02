const path = require('path')
const webpack = require('webpack')

module.exports = {
  // Emit ES5-compatible webpack runtime code (arrow-function-free) for old browsers
  target: ['web', 'es5'],
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'build/public')
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx']
  }
}
