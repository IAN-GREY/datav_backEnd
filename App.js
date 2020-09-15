/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2020-09-15 10:43:37
 * @LastEditors: 沈林圩
 */
var express = require('express');
const app = new express();
var bodyparser = require('body-parser');
var session = require('express-session');
var cookie = require('cookie-parser');
var path = require('path');
app.use(bodyparser.json());
app.set('jwtTokenSecret', 'YOUR_SCRET_STRING');
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
  res.header("Access-Control-Allow-Headers", "X-Requested-With,x-access-token");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  // res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
const project = require("./project");
const collection = require("./collection");
const user = require("./user");
const file = require("./file");
app.use("/file", file);
app.use("/user", user);
app.use("/project", project);
app.use("/collection", collection);
app.use(express.static(path.join(__dirname, 'uploads')))
var server = app.listen(8881, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("访问地址为 http://%s:%s", host, port);
});

global.app = app