'use strict';

const NODE_ENV = process.env.NODE_ENV || 'development';
const webpack = require('webpack');
const path = require('path');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let CopyWebpackPlugin = require('copy-webpack-plugin');

let EXTENSION_ID = NODE_ENV=='development' ? 'jcafkaiepnfcdahhgndhjohjdbadigoj':'aohpgnblncapofbobbilnlfliihianac';


module.exports = {
  context: path.resolve(__dirname, "./dev"),
  entry: {
    background: "./js/background",
    devtools: "./js/devtools",
  },

  output: {
    path: __dirname + '/public/assets',
    publicPath: 'chrome-extension://' + EXTENSION_ID + '/assets/',
    filename: "[name].js",
    library: "[name]"
  },

  watch: false, //NODE_ENV == 'development',

  watchOptions: {
    aggregateTimeout: 100
  },

  devtool: NODE_ENV == 'development' ? "cheap-inline-module-source-map" : null,

  plugins: [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      NODE_ENV: JSON.stringify(NODE_ENV)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: "common"
    }),
    new webpack.ProvidePlugin({
      '$':'jquery'
    }),
    new ExtractTextPlugin('[name].css'),
    new CopyWebpackPlugin([
        { from: 'js/content/index.js', to:'content.js' },
        { from: '../devtools-panel/dist/index.html', to:'../devtools-panel.html' },
        { from: '../devtools-panel/dist/assets/devtools-panel.js', to:'devtools-panel.js' },
        { from: '../devtools-panel/dist/assets/devtools-panel.css', to:'devtools-panel.css' },
        { from: '../devtools-panel/dist/assets/vendor.js', to:'vendor.js' },
        { from: '../devtools-panel/dist/assets/vendor.css', to:'vendor.css' },
        { from: '../devtools-panel/dist/assets/32px.png', to:'32px.png' }
    ],{
      copyUnmodified:true
    })
  ],

  resolve: {
    modulesDirectories: ['node_modules'],
    extensions:         ['', '.js', '.styl'],
    root: [
      path.resolve('./dev/js/utils'),
      path.resolve('./dev/js')
    ]
  },

  resolveLoader: {
    modulesDirectories: ['node_modules'],
    moduleTemplates:    ['*-loader', '*'],
    extensions:         ['', '.js']
  },        

  module: {
  	loaders:[{
  		test: /\.js$/,
  		loader: 'babel?presets[]=es2015'
  	},{
      test:/\.styl$/,
      loader: ExtractTextPlugin.extract('style','css!stylus?resolve url')
    },{
      test:   /\.(png|gif|jpg|svg|ttf|eot|woff|woff2)$/,
      loader: 'file?name=[path][name].[ext]'
    }]
  }
};

if (NODE_ENV == 'production') {
  console.log("- Production build!")
  module.exports.plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          // don't show unreachable variables etc
          warnings:     false,
          drop_console: true,
          unsafe:       true
        }
      })
  );
}