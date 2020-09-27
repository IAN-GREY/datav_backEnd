/*
 * @Description: 接口
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2020-09-27 11:42:18
 * @LastEditors: 沈林圩
 */
const express = require("express");
const router = express.Router();
var uuid = require('node-uuid');
const { Projects } = require('./model/model')
const auth = require('./middleware/auth')
router.use(auth)
/**
 * @description: //已发布项目验证密码
 * @param {pId} 项目唯一pId
 * @param {password} 密码
 * @return {string}
 */
router.get("/check-password", function (req, res) {
  const param = {
    pId: req.query.pId,
    password: req.query.password,
  }
  Projects.find(param, function (err, result) {
    if (err) throw err;
    if (result) {
      if (result[0].password == req.query.password) {
        res.json({
          code: 1,
          msg: '密码正确'
        });
      } else {
        res.json({
          code: 0,
          msg: '密码错误'
        });
      }
    }
  });
});
router.get("/get-all", function (req, res) {

  const param = {
    account: req.query.account
  }
  Projects.find(param, function (err, result) {
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
router.get("/getOne", function (req, res) {
  const param = {
    pId: req.query.pId
  }
  Projects.findOne(param, function (err, result) {
    if (err) throw err;
    if (result) {
      if (result.status == 0) {
        res.json({
          code: 0,
          msg: '项目未发布'
        });
      } else if (result.status == 1) {
        res.json({
          data: result,
          code: 1,
          msg: '查询成功'
        });
      } else if (result.status == 2) {
        res.json({
          code: 2,
          msg: '需要密码'
        });
      }

    }
  });
});
router.post("/create", function (req, res) {
  const id = uuid.v1()
  const param = {
    account: req.body.account,
    config_data: req.body.data,
    title: req.body.title,
    name: req.body.name,
    background: req.body.background,
    status: 0,
    password: '',
    pId: id
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  param['publish_date'] = year + '年' + month + '月' + day + '日 ' + hour + ':' + minute + ':' + second


  Projects.create(param, function (err, result) {
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
  if (!req.body.pid) {
    res.json({
      code: 400,
      msg: 'pId字段不能为空'
    });
    return
  }
  const param = {
    pId: req.body.pId,
  }
  Projects.deleteOne(param, function (err, result) {
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
  if (req.body.config_data) {
    param.$set['config_data'] = req.body.config_data
  }
  if (req.body.password) {
    param.$set['password'] = req.body.password
  }
  if (req.body.title) {
    param.$set['title'] = req.body.title
  }
  if (req.body.name) {
    param.$set['name'] = req.body.name
  }

  Projects.updateOne({ "pId": req.body.pId }, param, function (err, result) {
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

