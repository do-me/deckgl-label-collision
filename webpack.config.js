const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    index: './src/index.js',
    load_json: './src/load_json.js'
  },
  mode: 'development',
  output: {
    filename: (chunkData) => {
      return chunkData.chunk.name === 'load_json' ? 'load_json/[name].bundle.js' : '[name].bundle.js';
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
      filename: 'load_json/index.html',
      template: './src/load_json.html',
      chunks: ['load_json'],
    }),
    new MiniCssExtractPlugin(),
  ],
};