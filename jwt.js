/**
             * Created by Mloong on 2018/7/30
             * 实现单点登录
             */

            var jwtauth = require('./jwtauth.js')
            var moment = require('moment');
            var express = require('express');
            var jwt = require('jwt-simple');
            var app = express();
            var bodyparser = require('body-parser');
            var crypto = require('crypto');
            var session = require('express-session');
            var cookie = require('cookie-parser');
            var path = require('path');
            var multipart = require('connect-multiparty');
            var multipartMiddleware = multipart();
            
            app.set('jwtTokenSecret', 'YOUR_SCRET_STRING');
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
            app.use(function (req, res, next){
                if (req.url != '/login' && req.url != '/api/imgCode' && req.url != '/api/lone'){
                    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
                    console.log(req.headers['x-access-token'])
                    if (token) {
                        try {
                            var decoded = jwt.decode(token, app.get('jwtTokenSecret'));
                            console.log(decoded)
                            if( decoded.exp <= Date.now()) {
                                // res.end('Access token has expired', 400)
                                res.json({
                                    code: "400",
                                    data: "Token was out of date",
                                    msg: "invalid_token",
                                });
                            }
                            else if(decoded.iss){
                          
                                mdb.collection('user').findOne({ _id:ObjectId(decoded.iss)}, function(err, user) {
                                    req.user_id = user._id;
                             
                                    next()
                                  })
                                
                            }
                              
                        } catch (err) {
                            // return next()
                            // res.end('Access err', 400)
                            res.json({
                                code: "400",
                                data: "Token was not recognised",
                                msg: "invalid_token",
                            });
                        }
                    } else {
                        // res.end('  no Access ', 400)
                        res.json({
                            code: "400",
                            data: "Token was required",
                            msg: "invalid_token",
                        });
                    }
                }
                else {
                    next();
                }

            });
 
            /**
             * 连接mongodb
             */
            var MongoClient = require('mongodb').MongoClient;
            const ObjectId = require('mongodb').ObjectId;
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

            app.post('/login', function (req, res)
            {
                var username = req.body.account;
                var password = req.body.password;
                mdb.collection("user").findOne({username: username, password: password}, function (err, result)
                {
                    if (err) throw err;
                    if (result)
                    {
                  
                        var expires = moment().add(7,'days').valueOf();
                        var token = jwt.encode({
                                iss: result._id,
                                exp: expires,
                            }, app.get('jwtTokenSecret'));
                        
                        res.json({
                                token: token,
                                expires: expires,
                                user: result.username
                            })
                        
                    } else
                    {
                        res.json({
                            ret_code: 1,
                            ret_msg: '用户名或密码错误！'
                        });
                    }
                });
            });

            app.get('/getProject',function (req, res)
            {
                var pid = req.query.pid;
               
                // mdb.collection("project").find({}, function (err, result)
          
                mdb.collection("project").find({}).toArray( function (err, result)
                {
                    if (err) throw err;
                    if (result)
                    {
                        // console.log(result)
                        // res.send(result);
                        console.log(result)
                        res.json({
                            ret_code: 1,
                            ret_msg: '获取成功！',
                            data:result,
                        });
                        
                    } else
                    {
                        res.json({
                            ret_code: 1,
                            ret_msg: '获取错误！'
                        });
                    }
                });
            });
         
            app.post('/addProject', function (req, res)
            {
                var title = req.body.title;
                var name = req.body.name;
                var config_data = JSON.parse(req.body.config_data);
                
                mdb.collection('project').insertOne(
                    {   title: title,
                        name: name,
                        status:0,
                        config_data: config_data,
                        user_id: req.user_id
                    }, function (err, result)
                {
                    if (err) throw err;
                    if (result)
                    {
                            
                        res.json({
                            ret_code: 1,
                            ret_msg: '新建成功'
                        });
                    }
                });
            });
            function isNull(data){ 
                return (data == "" || data == undefined || data == null) ? true : false; 
            }
            app.post('/modifyProject', function (req, res)
            {
                var _id = req.body._id;
                var data = JSON.parse(req.body.data);
                var status = req.body.status;
                var params={}
                if(!isNull(data))
                    params['config_data']=data;
                if(!isNull(status))
                    params['status']=status;
           
                mdb.collection('project').updateOne({_id:ObjectId(_id)},{ $set : params }, function (err, result)
                {
                    if (err) throw err;
                    if (result)
                    {
                            
                        res.json({
                            ret_code: 1,
                            ret_msg: '更新成功'
                        });
                    }
                });
            });
            
            var server = app.listen(8881, function ()
            {
                var host = server.address().address;
                var port = server.address().port;
                console.log("访问地址为 http://%s:%s", host, port);
            });