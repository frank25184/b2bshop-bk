'use strict';
const logger = require('../libs/logger');

const env = process.env.NODE_ENV || 'test';

/*
 handle: promise
*/
 module.exports = (_promise) => {
// to.js
  return _promise.then(data => {
     return [null, data];
  })
  .catch(err => [err]);
} 
//   async function main() {
//     try {
//      let res = await _promise;
//      return res;
//     } catch(err) {
//       logger.debug('into error handler');
//       logger.error(`
//         err: ${err},
//       `);
//       throw new error(`error: ${err}`);
//     }
  
//   }

// };
