/*
 * @Description: 数据模型
 * @Author: 沈林圩
 * @Date: 2020-09-09 11:28:32
 * @LastEditTime: 2021-03-03 16:18:08
 * @LastEditors: 沈林圩
 */
const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost:27017/local", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
})

const userSchma = new mongoose.Schema({
  account: {
    type: String,
    unique: true, //只需要usernam为唯一值
    //必选字段 主键
    // required: [true, '请传入账号'],
    // //字符串的最小长度  minlength 和 maxlength都是用在字符串属性中的
    // minlength: [8, '账号长度不能小于8'],
    // //字符串的最大长度
    // maxlength: [12, '账号长度不能大于12'],
    // //去除字符串两边的空格
    // trim: true
  },
  nickname: {
    type: String,
  },
  password: {
    type: String,
  },
  avatar: {
    type: String,
  },
  created_time: {
    type: String,
  },

  groupNames: {
    type: Array,
  },
})

const projectSchma = new mongoose.Schema({
  account: {
    //所属账号
    type: String,
  },
  config_data: {
    //项目数据
    type: String,
  },
  bluePrint: {
    type: String,
  },
  title: {
    type: String,
  },
  name: {
    type: String,
  },
  status: {
    type: Number,
  },
  isPublished: {
    type: Boolean,
  },
  requirePassword: {
    //是否需要密码验证
    type: Boolean,
  },

  useIpWhiteList: {
    //是否ip白名单
    type: Boolean,
  },
  ipWhiteList: {
    //ip白名单
    type: Array,
  },
  password: {
    //访问密码

    type: String,
  },
  websiteTitle: {
    type: String,
  },
  websiteDescription: {
    type: String,
  },
  websiteIcon: {
    type: String,
  },
  pId: {
    type: String,
    unique: true, //唯一
  },
  publish_date: {
    type: String,
  },
  modify_date: {
    type: String,
  },

  typeId: {
    type: String,
  },
})
const codeSegmentSchma = new mongoose.Schema({
  account: {
    //所属账号
    type: String,
  },
  code: {
    type: String,
  },
  name: {
    type: String,
  },
  create_time: {
    type: String,
  },
  update_time: {
    type: String,
  },
  uuid: {
    type: String,
  },
})
const collectionSchma = new mongoose.Schema({
  account: {
    type: String,
  },
  name: {
    type: String,
  },
  jsonData: {
    type: String,
  },
})

const dataSourceSchma = new mongoose.Schema({
  account: {
    type: String,
  },
  type: {
    type: String,
  },
  name: {
    type: String,
  },
  api_url: {
    type: String,
  },
  api_type: {
    type: String,
  },
  api_params: {
    type: Object,
  },
  api_headers: {
    type: Object,
  },
  create_time: {
    type: String,
  },
})
const Users = mongoose.model("user", userSchma)
const Collections = mongoose.model("collection", collectionSchma)
const Projects = mongoose.model("project", projectSchma)
const dataSources = mongoose.model("dataSource", dataSourceSchma)
const codeSegments = mongoose.model("codeSegment", codeSegmentSchma)
module.exports = { Users, Collections, Projects, codeSegments, dataSources }
