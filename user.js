const express = require("express");
const router = express.Router();
var moment = require('moment');
var jwt = require('jwt-simple');

router.use((req, res, next) => {
    next()
})
router.get("/getOne",function (req,res) {
    let param={
        pId:req.query.pId
    }
    mdb.collection('project').findOne(param,function(err, result) {
        if (err) throw err;
        if (result)
        {  
            if(result.status == 0){
                res.json({
                    ret_code: 0,
                    ret_msg: '项目未发布'
                });
            }else if(result.status == 1){
                res.json({
                    data:result,
                    ret_code: 1,
                    ret_msg: '查询成功'
                });
            }else if(result.status == 2){
                res.json({
                    ret_code: 2,
                    ret_msg: '需要密码'
                });
            }
            
        }
    });
});
router.post("/register",function (req,res) {
    let  param={
        account:req.body.account,
        username:req.body.username,
        password:req.body.password,
        avatar:req.body.avatar,
    }
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    param['created_time']=year+'年'+month+'月'+day+'日'+hour+':'+minute+':'+second
    mdb.collection('user').findOne({account: req.body.account}, function (err, result)
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
            mdb.collection('user').insertOne(param, function (err, result)
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
});
router.get("/getOne",function (req,res) {
    const param={
        account:req.query.account,
    }
    mdb.collection('user').findOne(param, function (err, result)
        {
            if (err) throw err;
            if (result)
            {  
        
                res.json({
                    ret_code: -1,
                    ret_msg: '账号已存在'
                });
                
            }else{
                res.json({
                    ret_code: 1,
                    ret_msg: '账户名可用'
                });
            }
        });
});
router.post("/login",function (req,res) {
        var account = req.body.account;
        var password = req.body.password;
        mdb.collection("user").findOne({account: account, password: password}, function (err, result)
        {
            if (err) throw err;
            if (result)
            {
                
                var expires = moment().add(7,'days').valueOf();
                var token = jwt.encode({
                        account: result.account,
                        exp: expires,
                    }, app.get('jwtTokenSecret'));
                res.json({
                        token: token,
                        expires: expires,
                        user: result.username,
                        account:result.account,
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

module.exports = router; 

