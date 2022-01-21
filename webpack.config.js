const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const config = {
  entry: {
    index: './src/index.ts',
    worker: './src/worker.ts',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(ts|js)?$/,
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },
  plugins: [new HtmlWebpackPlugin({ chunks: ['index'], template: 'src/index.html' })],

  devServer: {
    static: path.join(__dirname, 'dist'),
    compress: true,
    port: 8000,
  },
};

module.exports = config;
