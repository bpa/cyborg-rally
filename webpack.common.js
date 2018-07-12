const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dist = path.resolve(__dirname, 'public');
const webpack = require('webpack');

module.exports = {
  entry: './js/Client.js',
  plugins: [
    new CleanWebpackPlugin(['public']),
    new HtmlWebpackPlugin({
      template: "./index.tpl.html",
      filename: "./index.html"
    }),
    new CopyWebpackPlugin([
      { from: 'node_modules/react/dist/*', to: dist, flatten: true },
      { from: 'node_modules/react-dom/dist/*', to: dist, flatten: true },
      { from: 'images/*.svg', to: dist },
    ]),
    new webpack.ProvidePlugin({
      'ws': ['./Util', 'ws'],
      'gs': ['./Util', 'gs'],
      'LASER_OPTION': ['./Util', 'LASER_OPTION'],
      'getFile': ['./Util', 'getFile'],
    })
  ],
  output: {
    path: dist,
    filename: 'cyborg-rally.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
