'use strict';
const nodemailer = require('nodemailer'),
  logger = require('./logger'),
  Mail = require('../models/Email'),
  config = require('../../src/common/get-config');

module.exports = config => {
  let smtpConfig = {
    host: config.mail_opts.host,
    port: config.mail_opts.port,
    secure: config.mail_opts.secure, // true for 465, false for other ports
    auth: {
      user: config.mail_opts.auth.user,
      pass: config.mail_opts.auth.pass
    }
  };
  
  let mailTransport = nodemailer.createTransport(smtpConfig);

  // verify connection configuration
  mailTransport.verify(function (error, success) {
    if (error) {
      console.log('SMTP configuration error: ' + error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  let smtpMail = config.adminMail;
  let errorRecipient = config.adminMail;

  //let from = ' "No Reply" <noreply@who.com>';
  let from =  ' "AI Highlights from CogList" <'+ smtpMail +'>'//' "No Reply" <'+ smtpMail +'>'


  function sendMail (to, subj, body, ...params) {
    return mailTransport.sendMail({
      from: from,
      to: to,
      subject: subj,
      html: body
      //text: text  //"Plaintext version of the message",
// generateTextFromHtml: true
        //attachments: [
          // {   // stream as an attachment
          //   filename: 'text4.txt',
          //   content: fs.createReadStream('file.txt')
          // },
       // ]   
       //from  https://nodemailer.com/message/attachments/
    }, async function (err) {
      let toObj;
      if(params[0]){
        toObj = await Mail.findOne({email: to}).exec();
      }

      if (err) {
        logger.error('Unable to send mail: ' + err);
        if(toObj){
          await Mail.findOneAndUpdate({ _id: toObj._id }, {sent: false,fail: true}).exec();
        }
        return;

      } else {
        logger.debug(`successfully send mail to ${to}`);
        if(toObj){
          await Mail.findOneAndUpdate({ _id: toObj._id }, {sent: true,fail: false}).exec();
        }
        return;
      }
    });
  }

    async function sendGroupMail(mailList, subj, body,...params) {
      let mailLimit = 200;//send mutiple times if more than 50
      let toGroupArr = mailList.slice(0,  mailLimit-1);
      let toObj;
      for (let mail of toGroupArr) {
          try {
            if(params[0]){
              logger.info(`exist params[0] then setting toobj...`)
              toObj = await Mail.findOne({email: mail}).exec();
              logger.info(`toobj: ${JSON.stringify(toObj)}`)
            }
              await mailTransport.sendMail({
                  from: from,
                  to: mail,
                  subject: subj,
                  html: body
              });
              if(toObj){
                await Mail.findOneAndUpdate({ _id: toObj._id }, {sent: true,fail: false}).exec();
                logger.info(`finish executing: Mail.findOneAndUpdate({ _id: toObj._id }, {sent: true,fail: false}).exec();`)
              }
              // await Mail.findOneAndUpdate({ email: mail }, { sent: true, fail: false }).exec();
              logger.debug(`Successfully sent mail to ${mail}`);
          } catch (err) {
            if(toObj){
              await Mail.findOneAndUpdate({ _id: toObj._id }, {sent: false,fail: true}).exec();
              logger.info(`finish setting {sent: false,fail: true}`);
            }
              logger.error('Unable to send mail: ' + err);
          }
      }
    }

    // toGroupArr.forEach(async function(mail,i,e){
    //   if(params[0]){
    //     toObj = await Mail.findOne({email: mail}).exec();
    //   }
    //  try {
    //   await mailTransport.sendMail({
    //     from: from,
    //     to: mail,//toGroupArr[i],
    //     subject: subj,
    //     html: body
    //     // generateTextFromHtml: true
    //   });
    //   if(toObj){
    //     await Mail.findOneAndUpdate({ _id: toObj._id }, {sent: true,fail: false}).exec();
    //     const executionTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 一天后
    //     setTimeout(async () => {
    //         logger.info('Starting to set sent to false...');
    //         await Mail.findOneAndUpdate({ _id: toObj._id }, {sent: false}).exec();
    //     }, executionTime - Date.now());
    //   }
    //   logger.debug(`successfully send mail to ${mail}`);      
    //  }catch (err) {
    //   if (err) {
    //     if(toObj){
    //       await Mail.findOneAndUpdate({ _id: toObj._id }, {sent: false,fail: true}).exec();
    //     }
    //     logger.error('Unable to send mail: ' + err);
    //     //return;
    //   }
    // }
    // })

  return {
    send: sendMail,
    sendToGroup: sendGroupMail,/**(mailList-array, subj, body) **/
    mailError: (message, filename, exception) => {
      let body = '<h1>Site Error</h1>' + 'message: <br><pre>' + message + '</pre><br>';
      if (exception) { body += 'exception:<br><pre>' + exception + '</pre><br>'; }
      if (filename) { body += 'exception:<br><pre>' + filename + '</pre><br>'; }

      sendMail(errorRecipient, 'Site Error', body);
    }
  };
};
