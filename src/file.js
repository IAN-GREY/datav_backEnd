const express = require("express");
const router = express.Router();
const multer = require('multer');
const path = require('path');
var fs = require('fs')
const compressing = require('compressing');
const auth = require('./middleware/auth')
router.use(auth)
var storage = multer.diskStorage({
  destination: path.join(__dirname, '/uploads')
});
var upload = multer({ storage: storage });
router.post("/upload", upload.single('file'), auth, function (req, res) {
  const destpath = path.join(__dirname, '/uploads/' + req.body.account + '/' + (req.body.path ? req.body.path + '/' : '') + req.file.originalname)
  try {
    if (fs.existsSync(destpath)) {
      res.json({
        code: 201,
        path: (req.body.path ? req.body.path + '/' : '') + req.file.originalname,
        msg: '同名文件已存在'
      });
      return
    } else {
      fs.readFile(req.file.path, (err, data) => {
        fs.writeFile(destpath, data, (err) => {
          res.json({
            code: 200,
            path: (req.body.path ? req.body.path + '/' : '') + req.file.originalname,
            msg: '文件上传成功'
          });
          fs.unlink(req.file.path, (err) => {
          })
        });
      });
    }
  } catch (error) {
    console.log(error)
    res.json({
      code: 201,
      msg: '文件上传失败'
    });
  }
});
router.post("/batch-upload", function (req, res) {
  console.log(11111111111111)
  var storage = multer.diskStorage({
    destination: path.join(__dirname, '/uploads')
  });
  var uploads = multer({
    storage: storage
  }).any();
  uploads(req, res, function (err) {
    let dir = JSON.parse(req.body.dir)
    if (!fs.existsSync(path.join(__dirname, '/uploads/' + req.body.account))) {
      fs.mkdirSync(path.join(__dirname, '/uploads/' + req.body.account))
    }
    dir.forEach(dirPath => {
      let newdirPath = dirPath.split('/')
      newdirPath.pop()
      makeNewDir(req.body.account, newdirPath)
    });
    if (err) {
      return res.end('Error');
    } else {
      req.files.forEach(function (item, index) {
        fs.readFile(item.path, (err, data) => {
          if (err) {
            return res.json({
              code: 201,
              msg: '上传失败'
            });
          }
          fs.writeFile(path.join(__dirname, '/uploads/' + req.body.account + '/' + dir[index]), data, (err) => {
            if (err) {
              return res.json({
                code: 201,
                msg: '上传失败'
              });
            }
            if (index == req.files.length - 1) {
              res.json({
                code: 200,
                msg: '上传成功'
              });
            }
            fs.unlinkSync(item.path)
          });
        });
      });
    }
  });
});
router.get("/get", function (req, res) {
  let pageSize = req.query.pageSize ? req.query.pageSize : 10;
  let pageNum = req.query.pageNum ? req.query.pageNum : 1;
  let queryPath = req.query.path ? '/' + req.query.path : ''
  const filepath = path.join(__dirname, '/uploads/' + req.query.account + queryPath)
  try {
    if (fs.existsSync(path.join(__dirname, '/uploads/' + req.query.account))) {
    } else {
      fs.mkdirSync(path.join(__dirname, '/uploads/' + req.query.account));
    }
    let fileData = []
    let totalSize = 0
    var files = fs.readdirSync(filepath);
    if (req.query.name) {
      files = files.filter(item => {
        return item.indexOf(req.query.name) !== -1
      })
    }
    let startIndex = pageNum > 1 ? (pageNum - 1) * pageSize : 0
    let endIndex = pageNum > 1 ? pageNum * pageSize - 1 : pageSize - 1
    let pagedFiles = files.slice(startIndex, endIndex)
    pagedFiles.forEach(function (file) {
      var states = fs.statSync(filepath + '/' + file);
      {
        var obj = {
          size: '',
          name: '',
          path: ''
        };
        obj.size = getdirsize(filepath + '/' + file)
        obj.createTime = states.birthtime;
        obj.isFolder = !states.isFile();
        obj.name = file;//文件名
        obj.path = filepath + '/' + file; //文件绝对路径
        fileData.push(obj)
      }
    })
    files.forEach(function (file) {
      let itemsize = getdirsize(filepath + '/' + file)
      totalSize += itemsize
    })
    res.json({
      data: {
        list: fileData,
        totalSize: totalSize,
        pageSize: pageSize,
        pageNum: pageNum,
        pages: Math.ceil(files.length / pageSize),
        total: files.length,
      },
      code: 200,
      msg: '上传成功'
    });
  } catch (error) {
    console.log(error)
    res.json({
      code: 404,
      msg: '文件不存在'
    });
  }
});
router.get("/get-all", function (req, res) {
  console.log('触发错误')
  // s = l
  const param = {
    account: req.query.account,
  }
  const filepath = path.join(__dirname, '/uploads/' + req.query.account)
  try {
    let tree = fileTree(filepath, 1, '', []);
    var newArr = tree.filter(item => item.split('/')[item.split('/').length - 1].indexOf(req.query.keyWord) !== -1)
    res.json({
      data: newArr,
      code: 1,
      msg: 'success'
    });
  } catch (error) {
    res.json({
      code: -1,
      msg: '文件不存在'
    });
  }
});
router.post("/delete", function (req, res) {
  const account = req.body.account;
  const filepath = path.join(__dirname, '/uploads/' + account + '/' + req.body.filepath)
  const nameList = req.body.name.split(',')
  try {
    nameList.forEach(element => {
      if (fs.statSync(filepath + '/' + element).isDirectory()) {
        deleteFolder(filepath + '/' + element)
      } else {
        fs.unlinkSync(filepath + '/' + element)
      }
    });
    res.json({
      code: 200,
      msg: '删除成功'
    });
  } catch (error) {
    res.json({
      code: 201,
      msg: '删除失败'
    });
  }
});
router.post("/rename", function (req, res) {
  const account = req.body.account;
  const filepath = path.join(__dirname, '/uploads/' + account + '/' + req.body.path)
 
  try {
    fs.rename(filepath+'/'+ req.body.oldName, filepath+'/'+ req.body.newName, function (err) {
      if (err) {
        throw err;
      }
      res.json({
        code: 200,
        msg: '重命名成功'
      });
    })
  } catch (error) {
    res.json({
      code: 201,
      msg: '重命名失败'
    });
  }
});
router.post("/move", function (req, res) {
  const account = req.body.account;
  const files = req.body.name.split(',')
  try {
    for (let index = 0; index < files.length; index++) {
      const sourceFile = path.join(__dirname, '/uploads/' + account + '/' + req.body.oldPath + '/' + files[index])
      const destPath = path.join(__dirname, '/uploads/' + account + '/' + req.body.newPath + '/' + files[index])
      let stats = fs.statSync(sourceFile);
      fs.exists(sourceFile, function (exist) {
        if (exist) {
          if (stats.isFile()) {// 判断是文件还是目录
            fs.writeFileSync(destPath, fs.readFileSync(sourceFile));
            fs.unlinkSync(sourceFile)
          } else if (stats.isDirectory()) {
            copyDir(sourceFile, destPath)// 是目录，递归复制
            deleteFolder(sourceFile);
          }
        } else {
          res.json({
            code: 201,
            msg: '文件不存在'
          });
          return
        }
      });
      if (index === files.length - 1) {
        res.json({
          code: 200,
          msg: '移动成功'
        });
      }
    }
  } catch (error) {
    res.json({
      code: 201,
      msg: '移动失败'
    });
  }
});
router.get("/download", function (req, res) {
  let fileName = req.query.name;
  let account = req.query.account;
  let fileDir = path.join(__dirname, '/uploads/' + account + '/' + req.query.path + '/' + fileName)
  stats = fs.statSync(fileDir);
  fs.exists(fileDir, function (exist) {
    if (exist) {
      res.set({
        "Content-type": "application/octet-stream",
        "Content-Disposition": "attachment;filename=" + encodeURI(fileName),
        'Content-Length': stats.size
      });
      let fReadStream = fs.createReadStream(fileDir);
      fReadStream.pipe(res);
    } else {
      res.set("Content-type", "text/html");
      res.send("file not exist!");
      res.end();
    }
  });
});
router.get("/batch-download", function (req, res) {
  let account = req.query.account;
  let filePath = req.query.path;
  let filesList = req.query.name.split(',')
  const destPath = path.join(__dirname, '/uploads/' + account + '_temp')
  mkdirsSync(destPath)
  for (let index = 0; index < filesList.length; index++) {
    const element = filesList[index];
    const sourceFile = path.join(__dirname, '/uploads/' + account + '/' + filePath + '/' + element)
    let stats = fs.statSync(sourceFile);
    fs.exists(sourceFile, function (exist) {
      if (exist) {
        if (stats.isFile()) {// 判断是文件还是目录
          fs.writeFileSync(destPath + '/' + filesList[index], fs.readFileSync(sourceFile));
        } else if (stats.isDirectory()) {
          copyDir(sourceFile, destPath)// 是目录，递归复制
        }
      } else {
        res.json({
          code: 3,
          msg: '文件不存在'
        });
      }
    });
  }
  compressing.zip.compressDir(destPath, destPath + '.zip')
    .then(() => {
      let stats = fs.statSync(destPath + '.zip');
      res.set({
        "Content-type": "application/octet-stream",
        "Content-Disposition": "attachment;filename=" + encodeURI(filesList.length > 0 ? 'file.zip' : filesList[0] + 'zip'),
        'Content-Length': stats.size
      });
      let fReadStream = fs.createReadStream(destPath + '.zip');
      fReadStream.pipe(res);
      deleteFolder(destPath);
      fs.unlinkSync(destPath + '.zip');
    })
    .catch(err => {
      console.error(err);
      deleteFolder(destPath);
      fs.unlinkSync(destPath + '.zip');
    });
});
router.post("/create", function (req, res) {
  let account = req.body.account;
  let filePath = req.body.path;
  const destPath = path.join(__dirname, '/uploads/' + account + '/' + filePath)
  try {
    mkdirsSync(destPath)
    res.json({
      code: 200,
      msg: '创建成功'
    });
  } catch (error) {
    res.json({
      code: 201,
      msg: '创建失败'
    });
  }
});
router.post("/coverImg", upload.single('file'), auth, function (req, res) {
  let name = req.body.account + '_coverImg_' + req.body.projectId + '.png'
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
function fileTree (target, deep, prev, tree) { //    target：当前文件的绝对路径    deep：层级
  // let prev = new Array(deep).join("/");
  let infos = fs.readdirSync(target);  // 读取当前文件目录
  let files = [];  // 创建一个数组 用来存放文件
  let dirs = [];  // 创建一个数组 用来存放文件夹
  infos.forEach(item => {  // 遍历获取到的当前文件
    let tmpdir = path.join(target, item);  //拼接文件的绝对路径
    let stat = fs.statSync(tmpdir);  // 获取文件的状态
    if (stat.isFile()) {  // 如果是一个文件
      files.push(item);   // 存放在files数组中
    } else {  // 如果不是一个文件
      dirs.push(item);  // 存放在dirs数组中
    }
  });
  dirs.forEach(item => {  // 遍历dirs数组  打印文件夹并递归
    tree.push(`${prev}/${item}`)
    let nexttarget = path.join(target, item); // 拼接文件夹的绝对路径 目的：以当前文件夹为目录
    let nextdeep = deep + 1;
    tree = fileTree(nexttarget, nextdeep, prev + '/' + item, tree)  // 再次调用tree函数  替换参数
  });
  let count = files.length - 1;   // 定义一个count 表示当前存放文件的数组长度-1
  files.forEach(item => {   // 遍历 files 数组
    tree.push(`${prev}/${item}`)
  })
  return tree
}
function makeNewDir (dir_path, dir) {
  if (!dir_path) {
    return
  }
  if (fs.existsSync(path.join(__dirname, '/uploads/' + dir_path))) {
    if (dir[0]) {
      makeNewDir(dir_path + '/' + dir[0], dir.slice(1))
    }
  } else {
    fs.mkdirSync(path.join(__dirname, '/uploads/' + dir_path))
    if (dir[0]) {
      fs.mkdirSync(path.join(__dirname, '/uploads/' + dir_path + '/' + dir[0]))
      if (dir[1]) {
        makeNewDir(dir_path + '/' + dir[0], dir.slice(1))
      }
    }
  }
}
function getdirsize (dir) {
  try {
    let size = 0
    let stats = fs.statSync(dir)
    if (stats.isFile()) {
      return stats.size
    }
    let files = fs.readdirSync(dir)
    if (files.length == 0) {
      return 0
    }
    var count = files.length;
    for (var i = 0; i < files.length; i++) {
      let _size = getdirsize(path.join(dir, files[i]))
      size += _size;
      if (--count <= 0) {//如果目录中所有文件(或目录)都遍历完成
        return size
      }
    }
  } catch (error) {
    console.log(err)
  }
}
function mkdirsSync (dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
function deleteFolder (path) {
  let files = [];
  if (fs.existsSync(path)) {
    files = fs.readdirSync(path);
    files.forEach(function (file, index) {
      let curPath = path + "/" + file;
      if (fs.statSync(curPath).isDirectory()) {
        deleteFolder(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
function _copy (src, dist) {
  var paths = fs.readdirSync(src)
  paths.forEach(function (p) {
    var _src = src + '/' + p;
    var _dist = dist + '/' + p;
    var stat = fs.statSync(_src)
    if (stat.isFile()) {// 判断是文件还是目录
      fs.writeFileSync(_dist, fs.readFileSync(_src));
    } else if (stat.isDirectory()) {
      copyDir(_src, _dist)// 当是目录是，递归复制
    }
  })
}
/*
* 复制目录、子目录，及其中的文件
* @param src {String} 要复制的目录
* @param dist {String} 复制到目标目录
*/
function copyDir (src, dist) {
  var b = fs.existsSync(dist)
  if (!b) {
    mkdirsSync(dist);//创建目录
  }
  _copy(src, dist);
}
module.exports = router;
