const express = require("express");
const router = express.Router();
var uuid = require('node-uuid');

router.use((req, res, next) => {
    next()
})
router.get("/checkPassword",function (req,res) {
    const param={
        pId:req.query.pId,
        password:req.query.password,
    }
    mdb.collection('project').find(param).toArray(function(err, result) {
        if (err) throw err;
        if (result)
        {  
            if(result[0].password == req.query.password){
                res.json({
                    ret_code: 1,
                    ret_msg: '密码正确'
                });
            }else{
                res.json({
                    ret_code: 0,
                    ret_msg: '密码错误'
                });
            }
        }
    });
});

router.get("/getAll",function (req,res) {
    let param={
        account:req.query.account
    }
    mdb.collection('project').find(param).toArray(function(err, result) {
        if (err) throw err;
        if (result)
        {  
          
            res.json({
                data:result,
                ret_code: 1,
                ret_msg: '查询成功'
            });
        }
    });
});
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
router.post("/add",function (req,res) {
    const id=uuid.v1()
    let  param={
        account:req.body.account,
        config_data:req.body.config_data,
        title:req.body.title,
        name:req.body.name,
        background:req.body.background,
        status:0,
        password:'',
        pId:id
    }
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    param['publish_date']=year+'年'+month+'月'+day+'日 '+hour+':'+minute+':'+second
    

    mdb.collection('project').insertOne(param, function (err, result)
        {
            if (err) throw err;
            if (result)
            {  
                res.json({
                    ret_code: 1,
                    ret_msg: '添加成功'
                });
            }
        });
});
router.post("/delete",function (req,res) {
    const param={
        pId:req.body.pId,
    }
    mdb.collection('project').deleteOne(param, function (err, result)
        {
            if (err) throw err;
            if (result)
            {  
                res.json({
                    ret_code: 1,
                    ret_msg: '删除成功'
                });
            }
        });
});
router.post("/update",function (req,res) {
    let param={
        $set:{

        }
    }
    if(req.body.config_data){
        param.$set['config_data']=req.body.config_data
    }
    if(req.body.password){
        param.$set['password']=req.body.password
    }
    if(req.body.title){
        param.$set['title']=req.body.title
    }
    if(req.body.name){
        param.$set['name']=req.body.name
    }
   
    mdb.collection('project').updateOne({"pId":req.body.pId},param, function (err, result)
        {
            if (err) throw err;
            if (result)
            {  
                res.json({
                    ret_code: 1,
                    ret_msg: '修改成功'
                });
            }
        });
});
module.exports = router; 

