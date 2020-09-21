/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-09-21 13:42:22
 * @LastEditTime: 2020-09-21 15:37:34
 * @LastEditors: 沈林圩
 */

const express = require("express");
const router = express.Router();
var uuid = require('node-uuid');
const { codeSegments } = require('./model/model')
const auth = require('./middleware/auth')
router.use(auth)

router.get("/get", function (req, res) {//
  const param = {
    account: req.query.account
  }
  codeSegments.find(param, function (err, result) {
    if (err) throw err;
    if (result) {
      res.json({
        data: result,
        code: 1,
        msg: '查询成功'
      });
    }
  });
});

router.post("/create", function (req, res) {
  const id = uuid.v1()
  const param = {
    account: req.body.account,
    code: req.body.code,
    name: req.body.name,
    uuid: id
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  param['create_time'] = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute + ':' + second
  codeSegments.create(param, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: '添加失败'
      });
    };
    if (result) {
      res.json({
        code: 200,
        msg: '添加成功'
      });
    }
  });
});
router.post("/delete", function (req, res) {
  if (!req.body.uuid) {
    res.json({
      code: 400,
      msg: 'uuid字段不能为空'
    });
    return
  }
  const param = {
    uuid: req.body.uuid,
  }
  codeSegments.deleteOne(param, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: '删除失败'
      });
      throw err;
    }
    if (result) {
      res.json({
        code: 200,
        msg: '删除成功'
      });
    }
  });
});
router.post("/update", function (req, res) {
  let param = {
    $set: {

    }
  }
  if (req.body.code) {
    param.$set['code'] = req.body.code
  }
  if (req.body.name) {
    param.$set['name'] = req.body.name
  }

  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  param.$set['update_time'] = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute + ':' + second
  codeSegments.updateOne({ "uuid": req.body.uuid }, param, function (err, result) {
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
module.exports = router;

