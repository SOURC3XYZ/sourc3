import path from 'path';
import fs from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
// import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import MomentTimezoneDataPlugin from 'moment-timezone-data-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import * as webpack from 'webpack';
import { Configuration } from 'webpack';

const CopyWebpackPlugin = require('copy-webpack-plugin');

interface IConfig extends Configuration {
  devServer: { [key:string]: any }
}

const lessToJs = require('less-vars-to-js');

const themeVariables = lessToJs(
  fs.readFileSync(path.join(__dirname, './ant-theme-vars.less'), 'utf8')
);

const build:IConfig = {
  entry: './src/index.tsx',
  bail: true,
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].js',
    assetModuleFilename: 'assets/[name][ext]',
    publicPath: '/'
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
  optimization: {
    nodeEnv: 'production',
    minimize: true,

    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',

      cacheGroups: {
        vendors: {
          chunks: 'all',
          test: /(antd|prism)/,
          priority: 100,
          name: 'vendors'
        }
      }
    }
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
    plugins: [new TsconfigPathsPlugin()],
    modules: [
      path.join(__dirname, './src/types'),
      path.join(__dirname, 'node_modules')
    ]
  },
  performance: {
    hints: false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  devServer: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin'
    },
    historyApiFallback: true,
    watchFiles: path.join(__dirname, 'src'),
    port: 5000,
    open: true,
    hot: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|tsx|ts)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './build/styles'
            }
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]--[hash:base64:5]'
              }
            }
          }
        ]
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                modifyVars: themeVariables
              }
            }
          }
        ]
      },
      {
        test: /\.(jpg|jpeg|png|gif|mp3|svg|wasm)$/,
        type: 'asset/resource'
        // use: ['file-loader']
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, './node_modules/beam-wasm-client-masternet/'),
          globOptions: {
            ignore: ['package.json']
          }
        }
      ]
    }),
    new CleanWebpackPlugin(),
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/),
    new MomentTimezoneDataPlugin({
      startYear: 1950,
      endYear: 2100,
      matchZones: /^America\//
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'public', 'index.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css',
      chunkFilename: 'styles/[id].css'
    }),
    new CompressionPlugin({
      include: /\/includes/,
      deleteOriginalAssets: true
    })
  ]
};
export default build;
