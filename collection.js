/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2020-09-09 14:28:03
 * @LastEditors: 沈林圩
 */

const express = require("express");
const router = express.Router();

const auth = require('./middleware/auth')
router.use(auth)
router.get("/get", function (req, res) {
  const param = {
    account: req.query.account,
  }
  mdb.collection('collection').find(param).toArray(function (err, result) {
    if (err) throw err;
    if (result) {
      res.json({
        data: result,
        ret_code: 1,
        ret_msg: '查询成功'
      });
    }
  });
});

router.post("/add", function (req, res) {

  let param = {
    name: req.body.name,
    jsonData: req.body.config_data,
    account: req.body.account_id,
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
        ret_code: 1,
        ret_msg: '添加成功'
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

