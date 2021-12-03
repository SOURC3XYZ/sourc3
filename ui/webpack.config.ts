import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import MomentTimezoneDataPlugin from 'moment-timezone-data-webpack-plugin';
import * as webpack from 'webpack';

export default {
  devtool: 'source-map',
  entry: './src/index.tsx',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js',
    assetModuleFilename: 'assets/[name][ext]'
  },
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  optimization: {
    nodeEnv: 'production',
    minimize: true
  },
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
    plugins: [new TsconfigPathsPlugin()],
    modules: [
      path.join(__dirname, './src/types'),
      path.join(__dirname, 'node_modules')
    ]
  },
  devServer: {
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
        loader: 'babel-loader',
        options: {
          plugins: [
            [
              'import',
              { libraryName: 'antd', libraryDirectory: 'lib' },
              'antd'
            ],
            // modularly import the JS that we use from ‘@ant-design/icons’
            [
              'import',
              {
                libraryName: '@ant-design/icons',
                libraryDirectory: 'es/icons'
              },
              'antd-icons'
            ],
            'lodash'
          ],
          presets: [
            ['@babel/env', { targets: { node: 6 } }]
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              url: true
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
    new BundleAnalyzerPlugin(),
    new webpack.ProvidePlugin({
      React: 'react'
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /(en)$/),
    new MomentTimezoneDataPlugin({
      startYear: 1950,
      endYear: 2100,
      matchZones: /^America\//
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'index.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'styles.css'
    }),
    new CompressionPlugin({
      include: /\/includes/,
      deleteOriginalAssets: true
    })
  ]
};
