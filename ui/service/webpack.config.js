const path = require('path');
const nodeExternals = require('webpack-node-externals');

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
};