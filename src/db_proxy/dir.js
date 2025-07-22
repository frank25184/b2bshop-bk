'use strict'
const User = require('../models/User'),
  Dir = require('../models/Project'),
  userProxy = require('../db_proxy/user'),
  moment = require('moment'),
  helper = require('../libs/utility'),
  validator = require('validator'),
  xss = require('xss'),
  config = require('../common/get-config'),
      // co_handle = require('../lib/co-handler'),
  logger = require('../libs/logger')

const asyncErrHandle = require('../common/asyncErrHandle')
const seo = require('../config/seo');

module.exports = {
    modifyProjects: function (posts, fn) {
        let that = this
        function fetchData (post) {
            return new Promise(function (resolve, reject) {
                            // posts.forEach(function(post){
                that.modifyProject(post, function (newPost) {
                  resolve(newPost)
                })
                            // });
            })
        }

        // 用数组里面的元素做请求，去获取响应数据
        var promiseArr = posts.map(function (thepost) {
          return fetchData(thepost)
        })

        Promise.all(promiseArr).then(function (respDataArr) {
            // 在这里使用最终的数据
            logger.debug(respDataArr)
            fn(respDataArr)
        }).catch(function (er) {
            logger.error(`err when using promise in modifiedPosts func: ${er.message ? er.message : er.stack}`)
            res.redirect('/response/error/404')
        })
    },

    modifyProject: function (post, cb) {
        
        let modifiedPost = post.processProject(post)

        cb(modifiedPost);

        // let modifiedComments

        // let getComments = new Promise(function (resolve, reject) {
        //     post.comments(post._id, function (comments) {
        //         resolve(comments)
        //     })
        // })

        // let getAuthorInfo = new Promise(function (resolve, reject) {
        //     User.findOne({_id: post.author}).exec(function(err, usr){
        //         if(err) {
        //             reject(err)
        //         }
        //         resolve(usr)
        //     })
        // })


        // Promise.all([getComments, getAuthorInfo]).then(function (values) {
        //     for (let i = 0; i < values.length; i++) {
        //         modifiedPost.comments = values[0]
        //         modifiedPost.postAuthor = values[1]
        //     }
        //     logger.debug('modifiedPost in modifyPost function' + modifiedPost)
        //     cb(modifiedPost)
        // });
    },
}