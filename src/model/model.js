/*
 * @Description: 数据模型
 * @Author: 沈林圩
 * @Date: 2020-09-09 11:28:32
 * @LastEditTime: 2020-09-09 14:26:13
 * @LastEditors: 沈林圩
 */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/local', { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });

const userSchma = new mongoose.Schema({
  account: {
    type: String,
    unique: true //只需要usernam为唯一值
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
  }
})

const projectSchma = new mongoose.Schema({
  account: {//所属账号
    type: String,
  },
  config_data: {//项目数据
    type: String,
  },
  title: {
    type: String,
  },
  name: {
    type: String,
  },
  status: {//项目状态 0：未发布；1：已发布；2：已发布（带密码）；
    type: Number,
  },
  password: {//对于status == 2 时的访问密码
    type: String,
  },
  pId: {
    type: String,
    unique: true //唯一
  },
  publish_date: {
    type: String,
  }
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

const Users = mongoose.model('user', userSchma)
const Collections = mongoose.model('collection', collectionSchma)
const Projects = mongoose.model('project', projectSchma)
module.exports = { Users, Collections, Projects }