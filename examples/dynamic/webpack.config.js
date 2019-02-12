const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'development',

  target: 'web',

  entry: './src/index.js',

  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: true
    }),

    new webpack.HotModuleReplacementPlugin(),

    new HtmlWebpackPlugin({
      title: 'Hello advanced Heatmap',
      template: './index.html'
    })
  ],

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },

  resolve: {
    modules: [
      // force webpack to use local node_modules of example, instead of lib node_modules
      // the reason lib has leaflet in peer and dev dep
      // so when webpack builds it look around and 1st what it founds is it libs node_modules
      // as a reason commands like: instanceOf(InnerClass) could doesn't work
      // because we would have 2 version of leaflet with different InnerClass.
      // it was class Point in bound method
      path.resolve(__dirname, 'node_modules'),
      // but because we don't have all deps in example we need to bind original node_modules as well
      path.resolve(__dirname, '..', '..', 'node_modules')
    ],

    // prefer module to recompile lib sources on example build
    mainFields: ['module', 'browser', 'main']
  },

  devServer: {
    compress: true,
    disableHostCheck: true,
    historyApiFallback: true,
    host: '0.0.0.0',
    hot: true,
    port: 7777
  }
}
