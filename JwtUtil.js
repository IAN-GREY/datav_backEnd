// 引入模块依赖
const fs = require('fs');
const path = require('path');
// const jwt = require('jsonwebtoken');
var jwt = require('jwt-simple');
var crypto = require('crypto');
// 创建 token 类
class Jwt {
    constructor(data) {
        this.data = data;

    }

    //生成token
    generateToken() {
        var buf = crypto.randomBytes(12);
        var token = buf.toString('hex');
        return token;
    }

    // 校验token
    verifyToken() {
        let token = this.data;
        let cert = fs.readFileSync(path.join(__dirname, '../server/pem/rsa_public_key.pem'));//公钥 可以自己生成
        let res;
        try {
            let result = jwt.verify(token, cert, {algorithms: ['RS256']}) || {};
            let {exp = 0} = result, current = Math.floor(Date.now() / 1000);
            if (current <= exp) {
                res = result.data || {};
            }
        } catch (e) {
            res = 'err';
        }
        return res;
    }
}

module.exports = Jwt;