const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: [
    './src/client/index.js',
    'webpack-hot-middleware/client'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.(ttf|html)$/i,
        type: 'asset/resource'
      }
    ]
  },
  output: {
    filename: 'client.js',
    path: path.resolve(__dirname, 'build/public')
  },
  resolve: {
    extensions: ['.js']
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    hot: true
  }
}
