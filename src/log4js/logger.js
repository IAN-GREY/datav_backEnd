/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-09-27 10:49:32
 * @LastEditTime: 2020-09-27 10:55:08
 * @LastEditors: 沈林圩
 */
var log4js = require('log4js');

var log4js_config = require("./config.js");
log4js.configure(log4js_config);
module.exports = log4js
var log4js = require('log4js');
var fs = require("fs");
var path = require("path");



var logDebug = log4js.getLogger('logDebug');
var logInfo = log4js.getLogger('logInfo');
var logWarn = log4js.getLogger('logWarn');
var logErr = log4js.getLogger('logErr');

helper.writeDebug = function (msg) {
  if (msg == null)
    msg = "";
  logDebug.debug(msg);
};

helper.writeInfo = function (msg) {
  if (msg == null)
    msg = "";
  logInfo.info(msg);
};

helper.writeWarn = function (msg) {
  if (msg == null)
    msg = "";
  logWarn.warn(msg);
};

helper.writeErr = function (msg, exp) {
  if (msg == null)
    msg = "";
  if (exp != null)
    msg += "\r\n" + exp;
  logErr.error(msg);
};

// 配合express用的方法
exports.use = function (app) {
  //页面请求日志, level用auto时,默认级别是WARN
  app.use(log4js.connectLogger(logInfo, { level: 'debug', format: ':method :url' }));
}

// 判断日志目录是否存在，不存在时创建日志目录
function checkAndCreateDir (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

// 指定的字符串是否绝对路径
function isAbsoluteDir (path) {
  if (path == null)
    return false;
  var len = path.length;

  var isWindows = process.platform === 'win32';
  if (isWindows) {
    if (len <= 1)
      return false;
    return path[1] == ":";
  } else {
    if (len <= 0)
      return false;
    return path[0] == "/";
  }
}
exports.logger = writeWarn(name){
  var logger = log4js.getLogger(name);
  logger.setLevel('INFO');
  return logger;
}