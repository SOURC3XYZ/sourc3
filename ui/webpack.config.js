const IgnorePlugin = require('webpack').IgnorePlugin
const path = require('path');

module.exports = {
  target: 'electron-main',
  entry: './dist/main.js',
  output: {
    path: path.join(__dirname, 'bundle'),
    filename: 'main.js',
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
