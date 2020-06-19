var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/runoob";
var mdb;

let  db=await MongoClient.connect(url)

console.log(db)
var dbo = db.db("local");
mdb = dbo;
// module.exports = mdb;
//   MongoClient.connect(url, function (err, db)
// {
//     if (err) throw err;
//     var dbo = db.db("local");
//     mdb = dbo;
//     module.exports = mdb;
// });
module.exports = mdb;

