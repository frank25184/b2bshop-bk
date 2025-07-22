/**
 * config
 */
 'use strict'
 const path = require('path')
 const appDir = path.dirname(require.main.filename)
 
 var childProcess = require('child_process')
 let hostname
 let dbUsername = process.env.dbUsername || 'frank'
 let dbPassword = process.env.dbPassword || 'Frank_24681'
 let mongoPort = process.env.MongoPort || 27017
 console.log('into production mode', dbUsername, dbPassword, mongoPort)
 
 childProcess.exec('hostname -f', function (err, stdout, stderr) {
   if (err) {
     console.log(err)
   }
   hostname = stdout.trim()
 })
 
 var config = {
   // debug 为 true 时，用于本地调试
   debug: true,
   env: 'production',
   adminMail: 'admin@coglist.com', 
   adminMailList: ['frank25184@sina.com','frank25184@gmail.com'],
   siteName: 'CogList',
  //  yearlyCharge: 588,
  //  trialCharge: 99,
  //  contractVipYear: 8, // month long
   host: hostname,
   baseUrl:'https://coglist.com',
   uploadDir: '/sites/b2bshop/src/public/upload/',//'/programs/gpt/gptDir/src/public/upload/',//
   //path.join(`${appDir}`, 'src/public/upload/'),
   dailyNewsDomainBlacklist: /(kernel\.org|pypi\.org|freerepublic\.com|Stacksocial\.com)/i,
 
   // mongodb 配置
   db: {
     mongo: {
       port: mongoPort,
       //uri: `mongodb://localhost:${mongoPort}/dapphz`, // ?authSource=groupForum
       options: {
         user: dbUsername || '',
         pass: dbPassword || '',
         db: { reconnectTries: Number.MAX_VALUE },
         server: {
           poolSize: 5
         }
       }
     },
     redis: {
         // redis config, default to the localhost
       'host': '127.0.0.1',
       'port': '6379',
       'db': 0,
       'pw': 'egABVtskzw54kA365D22',
       'ttl': 1000 * 60 * 60 * 24 * 30
     }
   },
 
   session_secret: 'mystereotype', // 务必修改
   auth_cookie_name: 'coglistsite',
 
   // 程序运行的端口
   port: process.env.PORT || 3888,
 
   // 话题列表显示的话题数量
   list_topic_count: 18,
   currentNews_count: 25,
   // 邮箱配置
  //  mail_opts: {
  //   host: 'smtppro.zoho.com',
  //   port: 465,
  //   secure: true,
  //   auth: {
  //     user: 'admin@coglist.com',
  //     pass: 'Frank_548331198'
  //   }
  // },
   mail_opts: {
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@minshengmedical.com',
      pass: 'Minshengmedical_8888'
    }
  },

  
  CHATGPT_API_KEYS: [
  ],
   // admin 可删除话题，编辑标签。把 user_login_name 换成你的登录名
   admins: { frank25184: true },
 
   // 是否允许直接注册（否则只能走 github 的方式）
   allow_sign_up: true,
 
   // oneapm 是个用来监控网站性能的服务
   oneapm_key: '',
 
   file_limit: '10MB',
 
   // 版块
   categories: [
    //  {'key': 'lowLayer-Appli', 'value': '底层技术-区块链技术与应用'},
  
   ],
   // // 版块
   // tabs: [
   //   ['share', '分享'],
   //   ['ask', '问答'],
   //   ['job', '招聘']
   // ],
 
   create_post_per_day: 1000, // 每个用户一天可以发的主题数
   create_reply_per_day: 1000, // 每个用户一天可以发的评论数
   visit_per_day: 1000 // 每个 ip 每天能访问的次数
 }
 
 if (process.env.NODE_ENV === 'test') {
   config.db = 'mongodb://127.0.0.1/db_name_test'
 }
 
 module.exports = config
 