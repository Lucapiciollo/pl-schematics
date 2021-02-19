/**
 * @author @l.piciollo
 * @email l.piciollo@accenture.com
 * @create date 2021-02-19 17:46:39
 * @modify date 2021-02-19 18:33:43
 * @desc [description]
 */
const webpack = require('webpack');
const pkg = require('./package.json');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const HtmlMinimizerPlugin = require("html-minimizer-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');
const FileListPlugin = require("./FileListPlugin")
const { argv } = require("process");
const WorkboxPlugin = require('workbox-webpack-plugin');
const fs = require('fs');
const ASSET_PATH = process;

module.exports = (config, options) => {


  config.output.filename = pkg.name + '.[name].[hash].' + JSON.stringify(pkg.version).replace(/"/g, '').replace(/[^0-9]/g, '-') + '.js';
  config.output.publicPath = '/';
  config.plugins.map(element => {
    return JSON.parse((JSON.stringify(element).replace(/\[name\]|\[file\]/g, pkg.name + ".[name].[hash].[file]")))
  });

  if (checkMode(config)) {
    config.optimization.removeEmptyChunks = true;
    config.optimization.usedExports = true;
    config.optimization.minimize = true;
    config.optimization.splitChunks = false;
    config.optimization.removeAvailableModules = true;
    config.optimization.minimizer.push(
      new TerserPlugin({
        sourceMap: false,
        terserOptions: {
          compress: {
            drop_debugger: true,
            drop_console: true
          }
        }
      })
    )
  }
  /*   config.plugins.push(
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
      })
    ); */

  config.plugins.push(
    new webpack.DefinePlugin({
      MODULE: "AppModule",
    }),
  );

  config.plugins.unshift(new FileListPlugin());
  return config;

};

function checkMode(config) {
  return ["development"].indexOf(config.mode) > 0;
} 