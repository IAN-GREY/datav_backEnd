/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2021-01-04 17:47:06
 * @LastEditors: 沈林圩
 */
const { Collections } = require('./model/model')
const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const auth = require('./middleware/auth');
const { ObjectId } = require('mongodb');
router.use(auth)
var storage = multer.diskStorage({
  destination: path.join(__dirname, '/uploads')
});
var upload = multer({ storage: storage });
router.get("/get", function (req, res) {
  const param = {
    account: req.query.account,
  }
  mdb.collection('collection').find(param).toArray(function (err, result) {
    if (err) throw err;
    if (result) {
      res.json({
        data: result,
        code: 200,
        msg: '查询成功'
      });
    }
  });
});


router.post("/update", function (req, res) {
  let param = {
    $set: {
      name:req.body.name
    }
  }

  Collections.updateOne({ "_id":ObjectId(req.body.id) }, param, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: '修改失败'
      });
      throw err
    };
    if (result) {
      res.json({
        code: 200,
        msg: '修改成功'
      });
    }
  });
});

router.post("/add", upload.single('img') ,auth,function (req, res) {

  let param = {
    name: req.body.name,
    jsonData: req.body.config_data,
    account: req.body.account,
   
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  param['create_time'] = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute + ':' + second
  mdb.collection('collection').insertOne(param, function (err, result) {
    if (err) throw err;
    if (result) {
 
      res.json({
        code: 200,
        data:{
          id:result.insertedId
        },
        msg: '添加成功'
      });

      let name = result.insertedId +'.png'
      const destpath = path.join(__dirname, '/uploads/' + req.body.account+'/collectedComp/'+name)

      fs.readFile(req.file.path, (err, data) => {
       
        fs.writeFile(destpath, data, (err) => {
          
        });
      });


    }
  });
});
router.post("/delete", function (req, res) {
  const param = {
    id: req.body.id,
  }
  mdb.collection('collection').deleteOne(param, function (err, result) {
    if (err) throw err;
    if (result) {
      res.json({
        ret_code: 1,
        ret_msg: '删除成功'
      });
    }
  });
});

module.exports = router;

