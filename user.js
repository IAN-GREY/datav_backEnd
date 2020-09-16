/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-08-24 12:48:29
 * @LastEditTime: 2020-09-16 11:30:50
 * @LastEditors: 沈林圩
 */
const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require('multer');
var fs = require('fs')
var moment = require('moment');
var jwt = require('jwt-simple');
const { Users } = require('./model/model')
const auth = require('./middleware/auth')
var storage = multer.diskStorage({
  destination: path.join(__dirname, '/uploads')
});
var upload = multer({ storage: storage });
var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
function generateMixed (n) {
  var res = "";
  for (var i = 0; i < n; i++) {
    var id = Math.ceil(Math.random() * 35);
    res += chars[id];
  }
  return res;
}
router.post("/register", function (req, res) {
  let param = {
    account: req.body.account,
    password: req.body.password,
    avatar: '',
  }
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();
  param['created_time'] = year + '年' + month + '月' + day + '日' + hour + ':' + minute + ':' + second
  param['nickname'] = '用户' + generateMixed(10)
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
            nickname: result.nickname,
            expires: expires,
            msg: '注册成功'
          });
        }
      });
    }
  });
});
router.post("/auth", auth, function (req, res) {
  var account = req.body.account;
  Users.findOne({ account: account }, function (err, result) {
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
          nickname: result.nickname,
          avatar: result.avatar,
        }
      })
    } else {
      res.json({
        code: 400,
        msg: 'token非法！'
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
          nickname: result.nickname,
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
router.post("/avatar", upload.single('file'), auth, function (req, res) {
  let name = req.body.account + '_avatar_' + new Date().getTime() + '.png'
  const destpath = path.join(__dirname, '/uploads/' + name)
  try {
    fs.readFile(req.file.path, (err, data) => {
      fs.writeFile(destpath, data, (err) => {
        res.json({
          code: 200,
          data: {
            avatar: name
          },
          msg: '上传成功'
        });
        fs.unlink(req.file.path, (err) => {
        })
      });
    });
  } catch (error) {
    console.log(error)
    res.json({
      code: 201,
      msg: '上传失败'
    });
  }

});

router.post("/update", auth, function (req, res) {
  let param = {
    $set: {

    }
  }
  if (req.body.avatar) {
    param.$set['config_data'] = req.body.avatar
  }
  if (req.body.nickname) {
    param.$set['title'] = req.body.nickname
  }
  Users.updateOne({ "account": req.body.account }, param, function (err, result) {
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
router.post("/newPassword", auth, function (req, res) {
  let param = {
    $set: {

    }
  }
  if (req.body.newPassword) {
    param.$set['password'] = req.body.newPassword
  }
  Users.findOne({ account: req.body.account }, function (err, result) {
    if (err) throw err;
    if (result) {
      if (result.password !== req.body.oldPassword) {
        res.json({
          code: 201,
          msg: '密码错误'
        });
        return
      }
      Users.updateOne({ "account": req.body.account }, param, function (err, result) {
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
    }
    else {
      res.json({
        code: 201,
        msg: '账号不存在'
      });
    }
  });
});
module.exports = router;

