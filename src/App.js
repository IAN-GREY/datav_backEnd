/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2021-01-04 13:42:12
 * @LastEditors: 沈林圩
 */
var express = require('express');
const app = new express();
var bodyparser = require('body-parser');
var session = require('express-session');
var cookie = require('cookie-parser');
var path = require('path');

const FLogger = require('./log4js/FLogger');

FLogger.log("这是一条日志测试打印 none not paramters！", 111, "uuuuuuuuu", null, { jj: 188, name: "hello" });
FLogger.log("none", "这是一条日志测试打印 none");
FLogger.log("debug", "这是一条日志测试打印 debug！");
FLogger.log("info", "这是一条日志测试打印 info！", "jjjjjjj", 8888, 0.8, null, "hhhhhhh");
FLogger.log("warn", "这是一条日志测试打印 warn", "jjjjfd");
FLogger.log("error", "这是一条日志测试打印 error！", 66);
FLogger.log("fatal", "这是一条日志测试打印 fatal");

FLogger.debug("debug", "这是一条日志测试打印 debug111111111！");
FLogger.info("info", "这是一条日志测试打印 info11111111！", "777", null);
FLogger.warn("warn", "这是一条日志测试打印 warn111111111111", 1123);
FLogger.error("error", "这是一条日志测试打印 error11111111111！", null);
FLogger.fatal("fatal", "这是一条日志测试打印 fatal111111111111", "kkkkkkkkkkkk");

// var log4js_config = require("./log4js/config.js");
// log4js.configure(log4js_config);

// var log = require('./logHelper');
// log.use(app);
// log4js.configure({
//   appenders: {
//     infoLogs: {
//       type: 'dateFile',
//       filename: 'F:/test/backEnd/src/logs/',
//       backups: 5,  // 仅保留最新的五个日志文件
//       pattern: ".yyyy-MM-dd", // 用于确定何时滚动日志的模式
//       alwaysIncludePattern: true,
//       compress: true
//     }
//   },
//   categories: {
//     // default: { appenders: ['infoLogs'], level: 'info' }
//     default: { appenders: ['ruleConsole', 'ruleFile'], level: 'info' }
//   }
// });
// log4js.configure({
//   // "customBaseDir": "F:/test/backEnd/src/logs/",
//   appenders: {
//     ruleConsole: { type: 'console' },

//     ruleFile: {
//       type: 'dateFile',
//       // filename: 'F:/test/backEnd/src/logs/',
//       filename: __dirname + '/log/logs/',//
//       pattern: 'yyyy-MM-dd.log',

//       maxLogSize: 10 * 1000 * 1000,

//       numBackups: 3,

//       alwaysIncludePattern: true

//     }

//   },

//   categories: {
//     default: { appenders: ['ruleConsole', 'ruleFile'], level: 'info' }

//   }

// });

// app.use(log4js.connectLogger(log4js.getLogger('access'), { level: log4js.levels.INFO }));


app.use(FLogger.netLog());
app.use(bodyparser.json());
app.set('jwtTokenSecret', 'YOUR_SCRET_STRING');//设置生成token的秘钥
/**
 * session,cookie中间件。
 */
app.use(cookie());
app.use(session({
  secret: 'secret', // 对session id 相关的cookie 进行签名
  resave: true,
  saveUninitialized: false, // 是否保存未初始化的会话
  cookie: {
    maxAge: 1000 * 60 * 60 * 2 // 设置 session 的有效时间，单位毫秒
  }
}));
app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(bodyparser.urlencoded({ extended: true }));
/**
 * 连接mongodb
 */
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/runoob";

/**
 * 请求数据库
 */
var mdb;
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("local");
  mdb = dbo;
  global.mdb = mdb
});

//设置跨域访问
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,x-access-token,Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
const project = require("./project");
const collection = require("./collection");
const user = require("./user");
const file = require("./file");
const codeSegment = require("./codeSegment");
app.use("/file", file);
app.use("/user", user);
app.use("/project", project);
app.use("/collection", collection);
app.use("/codeSegment", codeSegment);
app.use(express.static(path.join(__dirname, 'uploads')))

app.use(function (err, req, res, next) {


  if (err) {
    console.log('处理未知错误')
    console.log(err)
    FLogger.error("error", "未知错误", err, req.url, JSON.stringify(req.body), JSON.stringify(req.query));
    res.status(err.status || 500);
    res.json({
      code: 'error',
      data: {},
      message: '未知错误'
    });
  } else {
    next()
  }
});
process.env.host = process.env.NODE_ENV == 'development' ? 'http://localhost:8881' : 'http://www.shenlinwei.com'
var server = app.listen(8881, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("访问地址为 http://%s:%s", host, port);
});

global.app = app

