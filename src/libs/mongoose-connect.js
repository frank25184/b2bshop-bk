'use strict'
const config = require('../../src/common/get-config')
const mongodb = config.db.mongo
const mongoose = require('mongoose')
const logger = require('./logger')
const env = process.env.NODE_ENV || 'development';
// mongoose.connect(mongodb.uri, mongodb.options, function (err) {
//   if (err) {
//     console.error(`mongodb error : ${err.message ? err.message : err.stack}`)
//     process.exit(0)
//   }
// })
// if(env == "develop"){
//   mongoose.connect(`mongodb://localhost:27018/test`, function (err) {
//     if (err) {
//       logger.error(`develop: Mongoose default connection error: ${err.stack}`)
//       process.exit(0)
//     }
//     logger.info('Congratulations!  Mongodb connected.[mongoose.connect..]')
//   })
// }else{
  //mongodb://frank:Frank548331198@173.255.249.157:27017/dapphz?authSource=admin
  //mongodb://[username:password@]host1[:port1][,host2[:port2],...[,hostN[:portN]]][/[database][?options]]
  if(env == "development"){
    // mongoose.connect(`mongodb://${mongodb.options.user}:${mongodb.options.pass}@localhost:${mongodb.port}/dir?authSource=dir`, function (err) {
    //   if (err) {
    //     logger.error(`Mongoose default connection error: ${err.stack}`)
    //     process.exit(0)
    //   }
      
    // })
    mongoose.connect(`mongodb://127.0.0.1:27017/shop`, function (err) {
      if (err) {
        logger.error(`Mongoose default connection error: ${err.stack}`)
        process.exit(0)
      }
      
    })

  }else if(env == "production"){
    console.log('into production')
    mongoose.connect(`mongodb://${mongodb.options.user}:${mongodb.options.pass}@localhost:${mongodb.port}/b2bshop?authSource=admin`, function (err) {
      if (err) {
        logger.error(`Mongoose default connection error: ${err.stack}`)
        process.exit(0)
      }
      
    })    
  }

  //mongodb://frank25184:Frank548331198@45.33.39.102:27017/toolhz?authSource=admin
  
//}


// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on('connected', function () {
  console.log('Congratulations!  Mongodb connected.')
})

// If the connection throws an error
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', function () {
  logger.error('Mongoose default connection disconnected')
})

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    logger.info('Mongoose default connection disconnected through app termination')
    process.exit(0)
  })
})
