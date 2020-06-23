const express = require("express");
const router = express.Router();
const multer = require('multer');			//需要先引包 npm i -S multer
const fs = require('fs')
const path = require('path')

var upload = multer({dest:'uploads/'})

router.use((req, res, next) => {
    next()
})

router.post("/upload",function (req,res) {
    var storage = multer.diskStorage({ 
        destination: path.join(__dirname,'/uploads') 
    }); 
    var upload = multer({ 
        storage: storage 
    }).any(); 
   
    upload(req, res, function(err) { 
        if (err) { 
            console.log(err); 
            return res.end('Error'); 
        } else {        
            let account = req.body.account;
            if(!account){
                res.json({
                    ret_code: -1,
                    ret_msg: 'account is required!'
                });
                return 
            }
            req.files.forEach(function(item) { 
                let time = Date.now()+parseInt(Math.random()*999)+parseInt(Math.random()*2222);
                //拓展名
                let extname = item.mimetype.split('/')[1]
                //拼接成图片名
                let keepname = time+'.'+extname
                fs.exists(path.join(__dirname,'/uploads/'+account) , function (exists) {  //path为文件夹路径
                    var retTxt = exists ? retTxt = '文件存在' : '文件不存在';
                    if(retTxt == '文件存在'){
                        fs.writeFile(path.join(__dirname,'/uploads/'+account+'/'+keepname),item.path,(err)=>{
                            if(err){return res.send('写入失败')}
                            res.send({err:0,msg:'上传ok,覆盖',item:keepname})
                        });
                    }else{
                        fs.mkdir(path.join(__dirname,'/uploads/'+account), function (err) {
                            fs.readFile(item.path,(err,data)=>{
                                if(err){return res.send('上传失败')}
                                fs.writeFile(path.join(__dirname,'/uploads/'+account+'/'+keepname),data,(err)=>{
                                    if(err){return res.send('写入失败')}
                                    res.send({err:0,msg:'上传ok，新增',item:keepname})
                                });
                            });
                        })
                    }
                })
                    
                    
                
            }); 
            // res.end('File uploaded'); 
        } 
    }); 


});

router.get("/get",function (req,res) {
    const param={
        account:req.query.account,
    }
    const filepath=path.join(__dirname,'/uploads/'+req.query.account)


    

    try {
        var files = fs.readdirSync(filepath);//需要用到同步读取
        let fileData=[]
        let totalSize=0
        files.forEach(function(file) {
        
            var states = fs.statSync(filepath+'/'+file);
            console.log(states)
            // if(states.isDirectory())
            // {
            //     this.readFile(path+‘/‘+file,filesList);
            // }
            // else
            {
                //创建一个对象保存信息
                var obj = {
                    size:'',
                    name:'',
                    path:''
                };
                obj.size = states.size;//文件大小，以字节为单位
                obj.name = file;//文件名
                obj.path = filepath+'/'+file; //文件绝对路径
                fileData.push(obj)
                totalSize+=states.size
            }
    
        })
        res.json({
            data:fileData,
            totalSize:totalSize,
            ret_code: 1,
            ret_msg: 'success'
        });
    } catch (error) {
        res.json({
            ret_code: -1,
            ret_msg: '文件不存在'
        });
    }

    
});
router.post("/delete",function (req,res) {
    const account=req.body.account;
    const filename=req.body.filename;
    const filepath=path.join(__dirname,'/uploads/'+account+'/'+filename)
    try {
        fs.unlink(filepath, function(err){
            if(err){
                throw err;
            }
            res.json({
                ret_code: 1,
                ret_msg: '删除成功'
            });
        })
    } catch (error) {
        res.json({
            ret_code: -1,
            ret_msg: '删除失败'
        });
    }

    
});


module.exports = router;


