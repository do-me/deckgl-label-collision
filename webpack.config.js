const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    sdg: './src/sdg.js'
  },
  mode: 'development',
  output: {
    filename: (chunkData) => {
      return chunkData.chunk.name === 'sdg' ? 'sdg/[name].bundle.js' : '[name].bundle.js';
    },
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  devServer: {
    // ... other devServer configurations ...
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.svg$/,
        type: 'asset/resource',
        generator: {
          filename: '[name][ext]'
        }
      },
      // Add any additional rules here
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './src/index.html',
      chunks: ['index'],
    }),
    new HtmlWebpackPlugin({
      filename: 'sdg/index.html',
      template: './src/sdg.html',
      chunks: ['sdg'],
    }),
    new MiniCssExtractPlugin(),
  ],
};