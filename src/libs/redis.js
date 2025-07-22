//it's the underground for ./cache.js, which wrap the redis function
"use strict";
const config = require('../common/get-config');
var Redis = require('ioredis');
var logger = require('./logger')
//cost context = require('../modules/context');

var client = new Redis({
	  port: config.db.redis.port,
	  host: config.db.redis.host,
    //  username: config.db.redis.username, // needs Redis >= 6
    password: config.db.redis.pw,
	  db: config.db.redis.db,

    //   connectionName: 'rayman',
    //   connectTimeout: 1000,
    //   retryStrategy: () => {
    //     client.quit();
    //   }
});


client.on('ready',function(err) {
	if(err){
	    logger.error('connect to redis error for ready , check your redis config',errr);	
        process.exit(1);
	}

    logger.info("Redis is ready");
// //logger.trace('Entering cheese testing');
// logger.debug('Got cheese.');
// logger.info('Cheese is Gouda.');
// logger.warn('Cheese is quite smelly.');
// logger.error('Cheese is too ripe!');
// logger.fatal('Cheese was breeding ground for listeria.');
});

client.on("connect", runSample);
//without expiration version:

function runSample(err) {
    if(err){
        logger.error('connect to redis error', errr);	
        process.exit(1);
    }
    logger.info('connecting..')
    // // Set a value with an expiration
    // client.set('string key', 'Hello World', Redis.print);
    // // Expire in 3 seconds
    // client.expire('string key', 3);
 
    // // This timer is only to demo the TTL
    // // Runs every second until the timeout
    // // occurs on the value
    // var myTimer = setInterval(function() {
    //     client.get('string key', function (err, reply) {
    //         if(reply) {
    //             logger.info('I live: ' + reply.toString());
    //         } else {
    //             clearTimeout(myTimer);
    //             logger.info('I expired');
    //             client.quit();
    //         }
    //     });
    // }, 1000);
}

client.on('error', function (err) {
  if (err) {
    logger.error('connect to redis error, check your redis config', err);
    process.exit(1);
  }
});








exports = module.exports = client
 