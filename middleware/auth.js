/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-09-09 10:29:18
 * @LastEditTime: 2020-09-16 11:44:36
 * @LastEditors: 沈林圩
 */
const jwt = require('jwt-simple');
const auth = async (req, res, next) => {
  if (req.url != '/user/login') {
    var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token']
    if (token) {
      try {
        var decoded = jwt.decode(token, app.get('jwtTokenSecret'));//解码token
        if (decoded.exp <= Date.now()) {
          res.json({
            code: "400",
            data: "Token was out of date",
            msg: "invalid_token",
          });
        }
        else if (decoded.account) {
          mdb.collection('users').findOne({ account: decoded.account }, function (err, user) {
            if (user) {
              req.query.account = decoded.account;//通过token获取account加入get请求参数
              req.body.account = decoded.account;//通过token获取account加入post请求参数
              next()
            } else {
              res.json({
                code: "400",
                data: "Token was not recognised",
                msg: "invalid_token",
              });
            }
          })
        }
      } catch (err) {
        res.json({
          code: "400",
          data: "Token was not recognised",
          msg: "invalid_token",
        });
      }
    } else {
      res.json({
        code: "400",
        data: "Token was required",
        msg: "invalid_token",
      });
    }
  }
  else {
    next();
  }
}
module.exports = auth