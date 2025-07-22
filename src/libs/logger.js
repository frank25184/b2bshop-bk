'use strict';
const config = require('../common/get-config');
const env = process.env.NODE_ENV || 'develop';

const fs = require('fs'),
  logDir = 'logs';


// create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const winston = require('winston');
const { createLogger, format, transports } = require('winston');
//const winston = require('winston/lib/winston/config');
const { combine, timestamp, label, printf } = format;
require('winston-daily-rotate-file');


//const tsFormat = () => (new Date()).toLocaleTimeString();
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const transport_DailyRotate = new winston.transports.DailyRotateFile({
  filename: `${logDir}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxFiles: '14d',
  maxSize: '20m',
})
transport_DailyRotate.on('rotate', function(oldFilename, newFilename) {
  // do something fun
});

const logger = createLogger({  
  format: combine(
    label({ label: 'right meow!' }),
    timestamp(),
    myFormat,
  ),
  transports: [
    // colorize the output to the console
    new winston.transports.Console({
      level: env === 'develop' ? 'debug' : 'error'
    }),

    // Implement the code for the daily log file
    transport_DailyRotate
  ],

  // exceptionHandlers: [
  //   new winston.transports.File({ filename: 'exception.log' }),
  // ],
  // rejectionHandlers: [
  //   new winston.transports.File({ filename: 'rejections.log' }),
  // ]

});

module.exports = logger;







//reference: 1, https://github.com/winstonjs/winston
//           2,https://betterstack.com/community/guides/logging/how-to-install-setup-and-use-winston-and-morgan-to-log-node-js-applications/
//           3, https://www.npmjs.com/package/winston-daily-rotate-file