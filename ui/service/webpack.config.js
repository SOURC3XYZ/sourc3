const IgnorePlugin = require('webpack').IgnorePlugin
const path = require('path');

module.exports = {
  target: 'node',
  entry: './dist/server.js',
  output: {
    path: path.join(__dirname, 'bundle'),
    filename: 'bundle.js',
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
    ],
  },
  plugins: [
    new IgnorePlugin({ resourceRegExp: /build\/Debug\/nodegit.node/i })
  ]
};
