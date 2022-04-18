const IgnorePlugin = require('webpack').IgnorePlugin
const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: {
    "main": path.join(__dirname, 'dist', 'main.js'),
    "preload": path.join(__dirname, 'dist', 'preload.js')
  },
  output: {
    path: path.join(__dirname, 'bundle'),
    filename: '[name].js'
  },
  optimization: {
    minimize: true,
  },
  module: {
    rules: [
      {
        test: /sqlite3-binding\.js$/,
        use: ['sqlite3-loader'],
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      },
      {
        test: /\.txt|\.md$/, 
        use: 'raw-loader',
      }
    ],
  },
  plugins: [
    new IgnorePlugin({ resourceRegExp: /build\/Debug\/nodegit.node/i })
  ]
};
