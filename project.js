const express = require("express");
const router = express.Router();
// var mdb=require("./mongo.js");
// console.log('1111',mdb)
router.use((req, res, next) => {
    console.log(`路由执行成功啦~~~`, Date.now());
    next()
  })

router.post("/add",function (req,res) {
    const param={
        account:req.body.account,
        config_data:req.body.config_data,
        title:req.body.title,
        name:req.body.name,
    }
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
        pId:req.body.pId,
    }
    if(req.body.config_data){
        param.config_data=req.body.config_data
    }
    if(req.body.title){
        param.title=req.body.title
    }
    if(req.body.name){
        param.name=req.body.name
    }
    mdb.collection('project').deleteOne(param, function (err, result)
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

