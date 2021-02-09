/*
 * @Description:
 * @Author: 沈林圩
 * @Date: 2020-09-21 13:42:22
 * @LastEditTime: 2021-02-04 17:45:15
 * @LastEditors: 沈林圩
 */

const express = require("express")
const router = express.Router()
var uuid = require("node-uuid")
const { dataSources } = require("./model/model")
const { ObjectId } = require("mongodb")
const auth = require("./middleware/auth")
router.use(auth)
router.get("/get", function (req, res) {
  const param = {
    account: req.query.account,
  }
  dataSources.find(param, function (err, result) {
    if (err) throw err
    if (result) {
      res.json({
        data: result,
        code: 200,
        msg: "查询成功",
      })
    }
  })
})

router.post("/create", function (req, res) {
  // const id = uuid.v1()
  const param = {
    account: req.body.account,
    name: req.body.name,
    type: req.body.type,
    api_type: req.body.api_type,
    api_url: req.body.url || {},
    api_params: req.body.params || {},
    api_headers: req.body.headers || {},
  }
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  param["create_time"] =
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
  dataSources.create(param, function (err, result) {
    if (err) {
      res.json({
        code: 201,
        msg: "添加失败",
      })
    }
    if (result) {
      res.json({
        code: 200,
        msg: "添加成功s",
        data: {
          // uuid: uuid,
        },
      })
    }
  })
})
router.post("/delete", function (req, res) {
  if (!req.body.id) {
    res.json({
      code: 400,
      msg: "id字段不能为空",
    })
    return
  }
  const param = { _id: ObjectId(req.body.id) }

  dataSources.deleteOne(param, function (err, result) {
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
  let param = {
    $set: {},
  }
  if (req.body.params) {
    param.$set["api_params"] = req.body.params
  }
  if (req.body.url) {
    param.$set["api_url"] = req.body.api_url
  }
  if (req.body.headers) {
    param.$set["api_headers"] = req.body.headers
  }
  if (req.body.type) {
    param.$set["type"] = req.body.type
  }
  if (req.body.name) {
    param.$set["name"] = req.body.name
  }

  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  param.$set["update_time"] =
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
  dataSources.updateOne({ uuid: req.body.uuid }, param, function (err, result) {
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
