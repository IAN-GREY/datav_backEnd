/*
 * @Description: 
 * @Author: 沈林圩
 * @Date: 2020-09-27 10:47:33
 * @LastEditTime: 2020-09-27 10:48:12
 * @LastEditors: 沈林圩
 */
module.exports = {
  // "customBaseDir": "F:/test/backEnd/src/logs/",
  appenders: {
    ruleConsole: { type: 'console' },

    ruleFile: {
      type: 'dateFile',
      // filename: 'F:/test/backEnd/src/logs/',
      filename: __dirname + '/log/logs/',//
      pattern: 'yyyy-MM-dd.log',

      maxLogSize: 10 * 1000 * 1000,

      numBackups: 3,

      alwaysIncludePattern: true

    }

  },

  categories: {
    default: { appenders: ['ruleConsole', 'ruleFile'], level: 'info' }

  }

}