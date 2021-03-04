const express = require("express")
const router = express.Router()
var uuid = require("node-uuid")
const { Projects, Users } = require("./model/model")
const auth = require("./middleware/auth")
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
    if (err) throw err
    if (result) {
      if (result[0].password == req.query.password) {
        res.json({
          code: 200,
          msg: "密码正确",
        })
      } else {
        res.json({
          code: 201,
          msg: "密码错误",
        })
      }
    }
  })
})
router.get("/get-all", function (req, res) {
  let param = {
    account: req.query.account,
  }
  let sortParams = { publish_date: 1 }
  if (req.query.orderType) {
    sortParams[req.query.orderType] = 1
    delete sortParams.publish_date
  }
  Projects.find(param)
    .sort(sortParams)
    .exec(function (err, result) {
      if (err) throw err
      if (result) {
        res.json({
          data: {
            list: req.query.keyword
              ? result.filter(() => {
                  return result.name.indexOf(req.query.keyword) !== -1
                })
              : result,
            total: result.length,
          },
          code: 200,
          msg: "查询成功",
        })
      }
    })
})
router.get("/getOne", function (req, res) {
  console.log(11111, req.connection.remoteAddress)
  const param = {
    pId: req.query.pid,
  }
  Projects.findOne(param, function (err, result) {
    if (err) throw err
    if (result) {
      console.log(333, result)
      result.config_data = JSON.parse(result.config_data)
      if (req.query.account && req.query.account === result.account) {
        res.json({
          data: result,
          code: 200,
          msg: "查询成功",
        })
      } else if (
        result.requirePassword &&
        result.password !== req.query.password
      ) {
        res.json({
          code: 200,
          msg: "密码错误",
        })
      } else if (result.useIpWhiteList) {
        if (
          result.useIpWhiteList.findIndex(
            (v) => v.ip === req.connection.remoteAddress
          ) !== -1
        ) {
          res.json({
            data: result,
            code: 200,
            msg: "查询成功",
          })
        } else {
          res.json({
            code: 201,
            msg: "您不在项目IP白名单内",
          })
        }
      }
    }
  })
})
router.post("/create", function (req, res) {
  const id = uuid.v1()
  let param = {
    account: req.body.account,
    config_data: req.body.data,
    title: req.body.title,
    name: req.body.name,
    background: req.body.background,
    requirePassword: false,
    status: 0,
    pId: id,
    isPublished: false,
    bluePrint: "",
    password: "",
    useIpWhiteList: false,
    ipWhiteList: [],
    websiteTitle: "Datav",
    websiteIcon: "",
    websiteDescription: "这是一条测试描述",
    typeId: req.body.typeId,
  }

  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  param["publish_date"] =
    year +
    "年" +
    month +
    "月" +
    day +
    "日 " +
    hour +
    ":" +
    minute +
    ":" +
    second
  param["modify_date"] =
    year +
    "年" +
    month +
    "月" +
    day +
    "日 " +
    hour +
    ":" +
    minute +
    ":" +
    second
  Projects.create(param, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: "添加失败",
      })
    }
    if (result) {
      res.json({
        code: 200,
        msg: "添加成功",
      })
    }
  })
})
router.post("/delete", function (req, res) {
  if (!req.body.pId) {
    res.json({
      code: 400,
      msg: "pId字段不能为空",
    })
    return
  }
  const param = {
    pId: req.body.pId,
  }
  Projects.deleteOne(param, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: "删除失败",
      })
      throw err
    }
    if (result) {
      res.json({
        code: 200,
        msg: "删除成功",
      })
    }
  })
})
router.post("/update", function (req, res) {
  let base = {
    isPublished: "",
    config_data: "",
    bluePrint: "",
    password: "",
    title: "",
    name: "",
    status: "",
    requirePassword: "",
    useIpWhiteList: "",
    ipWhiteList: "",
    websiteTitle: "",
    websiteIcon: "",
    websiteDescription: "",
  }
  let param = {
    $set: {},
  }
  Object.keys(base).forEach((key) => {
    if (typeof req.body[key] !== "undefined" && req.body[key] !== "") {
      param.$set[key] = req.body[key]
    }
  })
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  param.$set["modify_date"] =
    year +
    "年" +
    month +
    "月" +
    day +
    "日 " +
    hour +
    ":" +
    minute +
    ":" +
    second
  Projects.updateOne({ pId: req.body.pId }, param, function (err, result) {
    console.log(1111, result)
    if (err) {
      res.json({
        code: 201,
        msg: "修改失败",
      })
      throw err
    }
    if (result) {
      res.json({
        code: 200,
        msg: "修改成功",
      })
    }
  })
})

router.post("/copyScreen", function (req, res) {
  const param = {
    pId: req.query.id,
  }

  Projects.findOne({ pId: req.query.id }, function (err, result) {
    if (err) throw err
    if (result) {
      const { title, config_data, name } = result
      const id = uuid.v1()
      var date = new Date()
      var year = date.getFullYear()
      var month = date.getMonth() + 1
      var day = date.getDate()
      var hour = date.getHours()
      var minute = date.getMinutes()
      var second = date.getSeconds()
      const publish_date =
        year +
        "年" +
        month +
        "月" +
        day +
        "日 " +
        hour +
        ":" +
        minute +
        ":" +
        second
      const modify_date =
        year +
        "年" +
        month +
        "月" +
        day +
        "日 " +
        hour +
        ":" +
        minute +
        ":" +
        second
      const project = {
        ...result,
        ...{
          publish_date,
          modify_date,
          title,
          config_data,
          name,
          status: "0",
          password: "",
          pId: id,
          account: req.query.account,
        },
      }

      Users.findOne({ account: req.query.account }, function (err, user) {
        if (err) throw err
        if (user) {
          Projects.create(param, function (err, result) {
            if (err) {
              res.json({
                code: 201,
                msg: "添加失败",
              })
            }
            if (result) {
              res.json({
                code: 200,
                msg: "添加成功",
              })
            }
          })
        }
      })
    }
  })

  Projects.create(project, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: "发送失败",
      })
    }
    if (result) {
      res.json({
        code: 200,
        msg: "发送成功",
      })
    }
  })
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  param.$set["modify_date"] =
    year +
    "年" +
    month +
    "月" +
    day +
    "日 " +
    hour +
    ":" +
    minute +
    ":" +
    second
  Projects.updateOne({ pId: req.body.pId }, param, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: "修改失败",
      })
      throw err
    }
    if (result) {
      res.json({
        code: 200,
        msg: "修改成功",
      })
    }
  })
})

module.exports = router
