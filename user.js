/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2020-09-10 14:40:52
 * @LastEditors: 沈林圩
 */
const express = require("express");
const router = express.Router();
const path = require('path');
var fs = require('fs')
var moment = require('moment');
var jwt = require('jwt-simple');
const { Users } = require('./model/model')
const auth = require('./middleware/auth')

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
        code: 400,
        msg: '用户名已存在请更换用户名！'
      });
    }
    else {
      Users.create(param, function (err, result) {
        if (err) throw err;
        if (result) {
          var expires = moment().add(7, 'days').valueOf();
          var token = jwt.encode({
            account: result.account,
            exp: expires,
          }, app.get('jwtTokenSecret'));
          res.json({
            code: 200,
            token: token,
            account: result.account,
            expires: expires,
            msg: '注册成功'
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
        code: 200,
        msg: '登录成功',
        token: token,
        expires: expires,
        data: {
          account: result.account,
        }
      })
    } else {
      res.json({
        code: 400,
        msg: '用户名或密码错误！'
      });
    }
  });
});
router.post("/avatar", function (req, res) {
  const filepath = path.join(__dirname, '/uploads/' + req.body.account + '_avatar.png')
  console.log('???', req.files)
  fs.writeFile(filepath, req.files[0].path, (err) => {
    if (err) {
      res.json({
        code: 200,
        data: {
          avatar: req.body.account + '_avatar.png'
        },
        msg: '上传失败'
      });
    } else {
      res.json({
        code: 200,
        data: {
          avatar: req.body.account + '_avatar.png'
        },
        msg: '上传成功'
      });
    }
  });
});
module.exports = router;

