const express = require("express");
const router = express.Router();
var uuid = require('node-uuid');

router.use((req, res, next) => {
   
    next()
  })
router.get("/get",function (req,res) {
    console.log(req)
    const param={
        account:req.body.account,
    }
    
    mdb.collection('project').find(param, function (err, result)
        {
            console.log(result.operation.cmd.query)
            if (err) throw err;
            if (result)
            {  
                res.json({
                    ret_code: 1,
                    ret_msg: '查询成功'
                });
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
        status:1,
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

