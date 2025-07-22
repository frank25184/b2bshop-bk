"use strict";
const User    = require('../models/User'),
    //   Best = require('../models/Best'),
    //   BestTag = require('../models/BestTag'),


   //   Post = require('../models/Post'),
      Category = require('../models/ProductCategory'),
      Subcategory = require('../models/ProductSubcategory'),
    //   Tag = require('../models/Tag'),
    //   Comment = require('../models/Comment'),
    //   userProxy = require('../db_proxy/user'),
    //   moment = require('moment'),    
    //   asyncErrHandle = require('../common/asyncErrHandle'),
      logger = require('../libs/logger'),
      utility = require('../libs/utility');                              


module.exports = {
    modifyCatsAsync: function (cats) {

        // 这是你请求数据的方法，注意我是用steTimeout模拟的
        let that = this
        function fetchData (cat) {
            return new Promise(function (resolve, reject) {
                that.modifyCat(cat, function (newCat) {
                    resolve(newCat)
                })
            })
        }

            // 用数组里面的元素做请求，去获取响应数据
        var promiseArr = cats.map(function (thecat) {
          return fetchData(thecat)
        })

        return  Promise.all(promiseArr)
   },

    modifyCats: function (cats, fn) {
        // 异步并发

                // 这是你请求数据的方法，注意我是用steTimeout模拟的
        let that = this
        function fetchData (cat) {
            return new Promise(function (resolve, reject) {
                            // posts.forEach(function(post){
                that.modifyTag(cat, function (newCat) {
                resolve(newCat)
                })
                            // });
            })
        }

                // 用数组里面的元素做请求，去获取响应数据
        var promiseArr = cats.map(function (thetag) {
          return fetchData(thetag)
        })

        Promise.all(promiseArr).then(function (respDataArr) {
                        // 在这里使用最终的数据
            logger.debug(respDataArr)
            fn(respDataArr)
        }).catch(function (er) {
            logger.error(`err when using promise in modifiedCategory func: ${er.message ? er.message : er.stack}`)
            throw er;
        })
},

modifyCat: function (ca, cb) {
        let modifiedCat = ca.processCategory(ca);

        logger.debug('modifiedTag in modifyCategory function' + modifiedCat)
        cb(modifiedCat)
},





};

