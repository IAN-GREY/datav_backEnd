/**
             * Created by Mloong on 2018/7/30
             * 实现单点登录
             */
            var express = require('express');
            // var app = express();
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
 
            /**
             * session,cookie中间件。
             */
            app.use(cookie());
            app.use(session({
                secret: 'secret', // 对session id 相关的cookie 进行签名
                resave: true,
                saveUninitialized: false, // 是否保存未初始化的会话
                cookie: {
                    maxAge: 1000 * 60 * 60 *2 // 设置 session 的有效时间，单位毫秒
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
            function genToken()
            {
                var buf = crypto.randomBytes(12);
                var token = buf.toString('hex');
                return token;
            }
 
 
            /**
             * 请求数据库
             */
            MongoClient.connect(url, function (err, db)
            {
                if (err) throw err;
                var dbo = db.db("local");
                mdb = dbo;
            });
 
            /**
             * 注册
             */
            app.get('/register', function (req, res)
            {
                res.sendFile(path.join(__dirname, './public/templates', 'register.html'));
            });
 
            app.post('/register', multipartMiddleware, function (req, res)
                {
                    var username = req.body.account;
                    var password = req.body.password;
                    mdb.collection('user').findOne({username: username}, function (err, result)
                    {
                        if (err) throw err;
                        if (result)
                        {
                                
                            res.json({
                                ret_code: 1,
                                ret_msg: '用户名已存在请更换用户名！'
                            });
                        }
                        else
                        {
                            mdb.collection('user').insertOne({username: username, password: password}, function (err, result)
                            {
                                if (err) throw err;
                                if (result)
                                {
                                        
                                    res.json({
                                        ret_code: 2,
                                        ret_msg: '注册成功'
                                    });
                                }
                            });
 
                        }
                    });
                }
            );
 
            /**
             * 登录
             */
            app.get('/login', function (req, res)
            {
                res.sendFile(path.join(__dirname, './public/templates', 'login.html'));
            });
            app.post('/login', function (req, res)
            {
                var username = req.body.account;
                var password = req.body.password;
                console.log(req.body)
                console.log(username)
                console.log(password)
                mdb.collection("user").findOne({username: username, password: password}, function (err, result)
                {
                    if (err) throw err;
                    if (result)
                    {
                        var ticket = genToken();
                        mdb.collection('token').insertOne({ticket: ticket,username:username}, function (err, Lresult) {});
                        req.session.ticket = ticket;
                        res.cookie.ticket = ticket;
                        // res.redirect('/index');
                    } else
                    {
                        res.json({
                            ret_code: 1,
                            ret_msg: '用户名或密码错误！'
                        });
                    }
                });
            });
 
            /**
             * 认证中心
             */
            app.get('/authentication', function (req, res)
            {
                if (req.session.ticket)
                {
                    console.log("进入认证");
                    var url = req.query.callback;
                    var token = req.session.ticket;
                    url = console.log(url + "?token=" + token);
                    res.redirect(url);
                }
                else
                {
                    res.redirect('/login');
                }
            });
 
            /**
             * 首页
             */
            app.get('/index', function (req, res)
            {
                if (req.session.ticket)
                {
                    
                    res.json({
                        ret_code: 1,
                        ret_msg: '用户名已存在请更换用户名！'
                    });
                }
                else
                {
                    res.redirect('/login');
                }
            });
 
            /**
             * 注销
             */
            app.post('/cancellation', function (req, res)
            {
                var token = req.session.ticket;
                delete req.session.ticket;
                mdb.collection('token').removeOne({ticket: token}, function (ree, result)
                {
                    if (err) throw err;
                    res.redirect('/login');
 
                });
                
            });
            app.post('/cancellation', function (req, res)
            {
                var token = req.session.ticket;
                delete req.session.ticket;
                mdb.collection('token').removeOne({ticket: token}, function (ree, result)
                {
                    if (err) throw err;
                    res.redirect('/login');
 
                });
 
            });
            // app.use('/project',require('./project.js'));

            // app.post('/addProject', function (req, res)
            // {
            //     var username = req.body.account;
            //     var password = req.body.password;
            //     mdb.collection('project').insertOne({a: 111, b: 222}, function (err, result)
            //                 {
            //                     if (err) throw err;
            //                     if (result)
            //                     {
                                        
            //                         res.json({
            //                             ret_code: 2,
            //                             ret_msg: '注册成功'
            //                         });
            //                     }
            //                 });
 
            // });

          
            //引入route模块
            const project  = require("./project");
            //加载admin模块
            app.use("/project",project);

            var server = app.listen(8881, function ()
            {
                var host = server.address().address;
                var port = server.address().port;
                console.log("访问地址为 http://%s:%s", host, port);
            });