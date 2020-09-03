var express = require('express');
const app = new express();
var bodyparser = require('body-parser');
var crypto = require('crypto');
var session = require('express-session');
var cookie = require('cookie-parser');
var path = require('path');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
app.use(bodyparser.json());
var mdb;

var jwtauth = require('./jwtauth.js')
var moment = require('moment');
var jwt = require('jwt-simple');
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
//app.set('tem', __dirname); //设置模板的目录
//app.set('view engine', 'html'); // 设置解析模板文件类型：这里为html文件
//app.engine('html', require('ejs').__express); // 使用ejs引擎解析html文件中ejs语法
app.use(bodyparser.json()); // 使用bodyparder中间件，
app.use(bodyparser.urlencoded({ extended: true }));


/**
 * 连接mongodb
 */
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/runoob";


/**
 * 生成令牌
 * 生成token
 * @return {string} return 返回值
 * */
function genToken () {
  var buf = crypto.randomBytes(12);
  var token = buf.toString('hex');
  return token;
}


/**
 * 请求数据库
 */
MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  var dbo = db.db("local");
  mdb = dbo;
  global.mdb = mdb
});

/**
 * 认证中心
 */
app.get('/authentication', function (req, res) {
  if (req.session.ticket) {
    console.log("进入认证");
    var url = req.query.callback;
    var token = req.session.ticket;
    url = console.log(url + "?token=" + token);
    res.redirect(url);
  }
  else {
    res.redirect('/login');
  }
});



/**
 * 注销
 */
app.post('/cancellation', function (req, res) {
  var token = req.session.ticket;
  delete req.session.ticket;
  mdb.collection('token').removeOne({ ticket: token }, function (ree, result) {
    if (err) throw err;
    res.redirect('/login');
  });

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
/**
 * token登陆检查
 */
// app.use(function (req, res, next){
//     if (req.url != '/user/login' && req.url != '/api/imgCode' && req.url != '/api/lone' && req.url != '/user/register' ){
//         var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
//         console.log(req.url)
//         console.log(req.headers['x-access-token'])
//         if (token) {
//             try {
//                 var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
//                 console.log(decoded)
//                 if( decoded.exp <= Date.now()) {
//                     // res.end('Access token has expired', 400)
//                     res.json({
//                         code: "400",
//                         data: "Token was out of date",
//                         msg: "invalid_token",
//                     });
//                 }
//                 else if(decoded.account){

//                     mdb.collection('user').findOne({ account:decoded.account}, function(err, user) {
//                         // req.user_id = user._id;

//                         next()
//                         })
//                 }

//             } catch (err) {
//                 // return next()
//                 // res.end('Access err', 400)
//                 res.json({
//                     code: "400",
//                     data: "Token was not recognised",
//                     msg: "invalid_token",
//                 });
//             }
//         } else {
//             // res.end('  no Access ', 400)
//             res.json({
//                 code: "400",
//                 data: "Token was required",
//                 msg: "invalid_token",
//             });
//         }
//     }
//     else {
//         next();
//     }

// });
const project = require("./project");
const collection = require("./collection");
const user = require("./user");
const file = require("./file");
app.use("/file", file);
app.use("/user", user);
app.use("/project", project);
app.use("/collection", collection);

app.use(express.static(path.join(__dirname, 'uploads')))
// app.use('static', __dirname + '/uploads');



var server = app.listen(8881, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("访问地址为 http://%s:%s", host, port);
});

global.app = app