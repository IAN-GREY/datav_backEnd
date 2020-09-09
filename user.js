/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2020-09-09 14:22:37
 * @LastEditors: 沈林圩
 */
const express = require("express");
const router = express.Router();
var moment = require('moment');
var jwt = require('jwt-simple');
const { Users } = require('./model/model')
const auth = require('./middleware/auth')
router.use(auth)
router.post("/register", function (req, res) {
  let param = {
    account: req.body.account,
    password: req.body.password,
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  param['created_time'] = year + '年' + month + '月' + day + '日' + hour + ':' + minute + ':' + second
  Users.findOne({ account: req.body.account }, function (err, result) {
    if (err) throw err;
    if (result) {
      res.json({
        ret_code: 1,
        ret_msg: '用户名已存在请更换用户名！'
      });
    }
    else {
      Users.insertOne(param, function (err, result) {
        if (err) throw err;
        if (result) {
          var expires = moment().add(7, 'days').valueOf();
          var token = jwt.encode({
            account: result.account,
            exp: expires,
          }, app.get('jwtTokenSecret'));
          res.json({
            ret_code: 2,
            token: token,
            account: result.account,
            expires: expires,
            ret_msg: '注册成功'
          });
        }
      });

    }
  });
});
router.post("/login", function (req, res) {
  var account = req.body.account;
  var password = req.body.password;
  Users.findOne({ account: account, password: password }, function (err, result) {
    if (err) throw err;
    if (result) {
      var expires = moment().add(7, 'days').valueOf();
      var token = jwt.encode({
        account: result.account,
        exp: expires,
      }, app.get('jwtTokenSecret'));
      res.json({
        token: token,
        expires: expires,
        nickname: result.nickname,
        account: result.account,
      })
    } else {
      res.json({
        ret_code: 1,
        ret_msg: '用户名或密码错误！'
      });
    }
  });
});

module.exports = router;

