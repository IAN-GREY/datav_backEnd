






var MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017/runoob";
var mdb;

MongoClient.connect(url, function (err, db)
{
    if (err) throw err;
    var dbo = db.db("local");
    mdb = dbo;
    mdb.collection('project').remove({}) 
});

