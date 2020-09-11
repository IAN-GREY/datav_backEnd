/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-09-10 14:20:31
 * @LastEditTime: 2020-09-10 14:26:36
 * @LastEditors: 沈林圩
 */
const path = require('path');
const config = require('./config.js');

const nodeModules = {
  require3: 'commonjs2 require3',
};

function resolve (dir) {
  return path.join(__dirname, './backend', dir);
}

module.exports = {
  entry: {
    backend: resolve('App.js'),
  },
  target: 'node',
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    library: 'backend',
    libraryTarget: 'commonjs2',
  },
  externals: nodeModules,
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [],
  },
  node: {
    console: false,
    global: false,
    process: false,
    __filename: false,
    __dirname: false,
    Buffer: false,
    setImmediate: false,
  },
};