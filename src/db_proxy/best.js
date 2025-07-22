'use strict'
const User = require('../models/User'),
  Best = require('../models/Best'),
  Site = require('../models/Site'),
  userProxy = require('./user'),
  moment = require('moment'),
  helper = require('../libs/utility'),
  validator = require('validator'),
//   xss = require('xss'),
  config = require('../common/get-config'),
      // co_handle = require('../lib/co-handler'),
  logger = require('../libs/logger');

const asyncErrHandle = require('../common/asyncErrHandle')
const seo = require('../config/seo');
module.exports = {
    /**
    * get best articles by category, return an array [posts,count]
    * 
    * @param {Object} condition which condition to obey for the articles got
    * @param {Array} fields ['type','date_added'] // Columns to Return,
    * @param {String} order  {skip:0, // Starting Row, limit:10,sort:{date_added: -1} //Sort by Date Added DESC}
    * 
    * 
    */
  getPopularBests:  function(req,res,condition={},fields=null, order=null ){
    // Find First 10 News Items
    let bests = Best.find(condition,fields,order).exec();
    
    return bests;
  },

  // how to get example: let 2popularBest = await getPopularBests(req,res,{},["title","updated_at","title_changed"],{limit:1,sort:{pv:-1}})

    /**
    * get best articles by category, return an array [posts,count]
    * @param {String} caategory category you passed
    */
  getBestsByCategory: async function(req,res,category){
    //const user_created_at = moment(req.user.created_at).format('MMMM Do YYYY, h:mm:ss a'),

        //判断是否是第一页，并把请求的页数转换成 number 类型
       const page = req.query.p ? parseInt(req.query.p) : 1,
             outThis = this;
       let loginedUser;
       const user = req.user;
       if(user){
         loginedUser = user.processUser(user);
       }
    
       // let weeklyRec = yield Best.findOne({weeklyRecommend: true}).exec();

       const getPostCountPromise = new Promise(function(resolve,reject){
            //查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
            outThis.getTen(category, page, (err, posts, count)=> {
                if (err) {
                    logger.error('some error with getting the 10 personal posts:'+ err);
                    //next(err);
                    reject(`some error with getting the 10 personal posts: ${err}`);
                    posts = [];
                }else{
                    // logger.info('getPostsByUserId\'s getTen: '+ user_id +posts);
                    resolve([posts,count]);                           

                }
           },undefined,undefined,undefined,undefined, 'exist_category');

       });
       return getPostCountPromise;
      //  p.then(function(posts,count){

      //  })
      //  .catch(function(err){
      //     console.log(err.message);
      //     req.flash('error','Error finding the user!');
      //     res.redirect('back');
      //  });
    

},






  /**
    * get post by title.return a promise;use await once you need to get data: await bestProxy.getBestByTitle(req,res,title);
    * @param {String} title_changed  use changed title in db (with -)
    */
   getBestByTitle: async function (req,res,title_changed) {

    if(!title_changed){
        req.flash('error','Title not existing or is null/undefined');
        res.redirect('back');
    }else{
        let loginedUser;
        if(req.user){
            loginedUser = req.user.processUser(req.user);
        }

        logger.info('into getBestByTitle')

          let findBest =  function (theName){
            return new Promise(function(resolve,reject){
                Best.findOne({'title_changed': theName},function(err,best){
                        if (err) {
                            logger.error('error in find a best article' + JSON.stringify(err));
                            return;
                        } else {
                            //setting view times
                            var conditions = { 'title_changed': theName },
                                update = { $inc: { 'pv': 1 }};//increment
                            Best.findOneAndUpdate(conditions, update, function(err,best){
                                if(err){
                                    console.log(`there is error when update the pv: ${err}`);
                                    return;
                                }
                            });   
                            //logger.debug('find best: '+ JSON.stringify(best))
                            resolve(best);                                 
                    
                      }                            
                });
            });
          }

          let best =  findBest(title_changed);
          //logger.debug('result best: '+ JSON.stringify(best))
          return best;


        //   findBest(title).then(function(best){
        //         let newBest = best.processSite(best);
        //         logger.info('best' + JSON.stringify (newBest) );
    
                





        //         res.render(path, {
        //                 user: req.user ? req.user.processUser(req.user) : req.user,
        //                 postUser: req.user ? (req.user._id == site.user_id ? loginedUser : theuser) : theuser,
        //                 best: newBest,
        //                 category: category,
        //                // comments: comments,
        //                 messages: {
        //                     error: req.flash('error'),
        //                     success: req.flash('success'),
        //                     info: req.flash('info'),
        //                 }, // get the user out of session and pass to template
        //         });

        //         console.log("Done");
        //   })






    }
},


  /**
    * get post by title.return a promise;use await once you need to get data: await bestProxy.getBestByTitle(req,res,title);
    * @param {String} name could be replaced with tag_id, title,user_id, group_id,category; 
    * @param {String} page the number of the page
    * @param {String} callback with data inside
    * @param {String} args   a number of string arguments , only used to depend if we use query.title or query.category.
  */

getTen: function (name, page, callback, ...args) {
  let query = {}
  const globalThis = this
  const topicCount = config.list_topic_count
  if (name) {
    if (args[0]) {
      query.tag_id = name
    } else if (args[1]) {
      query.title = name
    } else if (args[2]) {
      query.user_id = name
    } else if (args[3]) {
      query.group_id = name
    } else if (args[4]){
      query.category = name
    }
                  // console.log(`query[${name}] is`+ Object.keys(query));
  }

  const getCount = new Promise(function (resolve, reject) {
    // 使用 count 返回特定查询的文档数 total
    Best.count(query, (err, count) => {
      // 根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
      if (err) {
        // return callback(err);
        reject(err)
        return
      }
      logger.debug(`Number of posts: ${count} . query is ${query}`)
      resolve(count)
    })
  })
  getCount.then(function (count) {
    Best.find(query).skip((page - 1) * topicCount).limit(topicCount).sort({'updated_at': -1}).exec((err, posts) => {
      if (err) {
        logger.error(`no posts found: ${err}`)
        // throw.error('no post found');
        res.redirect('/errors/404')
      }
                          // console.log('Posts inthe getTen function is: '+posts);

                              // console.log('modifiedPosts: '+JSON.stringify(modifiedPosts));
                             // let modifiedPosts = globalThis.modifyPosts(posts);

      globalThis.modifyBests(posts, function (err, newPosts) {
        if(err){
          callback(err)
        }
        callback(null, newPosts, count)
      })

    })
  })
  .catch(function (err) {
    return callback(err.message ? err.message : err)
  });

},


//return promise
modifyBests: function (posts,fn) {
  // 异步并发
  // 这是你请求数据的方法，注意我是用steTimeout模拟的
    let that = this;
    function fetchData (post) {
      return new Promise(function (resolve, reject) {
        that.modifyBest(post, function (newPost) {
          resolve(newPost)
        })
      })
    }

      // 用数组里面的元素做请求，去获取响应数据
    var promiseArr = posts.map(function (thepost) {
    return fetchData(thepost)
    })
    
    Promise.all(promiseArr).then(function (respDataArr) {
          // 在这里使用最终的数据
      logger.debug(respDataArr)
      fn(undefined, respDataArr)
    }).catch(function (er) {
      logger.error(`err when using promise in modifiedBests func: ${er.message ? er.message : er.stack}`)
      fn(er, '');
    })
},

//return promise
modifyBestsWithoutCallback: function (posts) {
  // 异步并发
  // 这是你请求数据的方法，注意我是用steTimeout模拟的
    let that = this;
    function fetchData (post) {
      return new Promise(function (resolve, reject) {
        that.modifyBest(post, function (newPost) {
          resolve(newPost)
        })
      })
    }

      // 用数组里面的元素做请求，去获取响应数据
    var promiseArr = posts.map(function (thepost) {
    return fetchData(thepost)
    })
    
    return Promise.all(promiseArr);
    // Promise.all(promiseArr).then(function (respDataArr) {
    //       // 在这里使用最终的数据
    //   logger.debug(respDataArr)
    //   fn(undefined, respDataArr)
    // }).catch(function (er) {
    //   logger.error(`err when using promise in modifiedBests func: ${er.message ? er.message : er.stack}`)
    //   fn(er, '');
    // })
},




modifyBest: function (post, cb) {
  let modifiedPost = post.processBest(post)

  let modifiedComments

  let getComments = new Promise(function (resolve, reject) {
    post.comments(post._id, function (comments) {
      resolve(comments)
    })
  })
  // let getGroup = new Promise(function (resolve, reject) {
  //   post.group(post.group_id, function (group) {
  //     resolve(group)
  //   })
  // })


  let getAuthorInfo = new Promise(function (resolve, reject) {
    User.findOne({_id: post.author}).exec(function(err, usr){
      if(err) {
          reject(err)
      }
      resolve(usr)
    })
  })


  Promise.all([getComments, getAuthorInfo]).then(function (values) {
    for (let i = 0; i < values.length; i++) {
      modifiedPost.comments = values[0]
      modifiedPost.postAuthor = values[1]
    }
    logger.debug('modifiedBest in modifyBest function' + modifiedPost)
    cb(modifiedPost)
  })
},


        /**
         * 根据用户名列表查找用户列表
         * Callback:
         * - err, 数据库异常
         * - users, 用户列表
         * @param {Array} names 用户名列表
         * @param {Function} callback 回调函数
         */
        // exports.getPostsByUserId = function (user_id, callback) {
        //   if (user_id.length === 0) {
        //     return callback(null, []);
        //   }
        //   Post.find({ 'user_id': user_id }, callback);
        // };
        /**
         * 根据用户名列表查找用户列表
         * Callback:
         * -
         * - users, 用户列表
         * @param {Array} names 用户名列表
         * @param {Function} callback 回调函数
         */
  // getPostsByUserId: function (req, res, user_id, fn) {
  //           // const user_created_at = moment(req.user.created_at).format('MMMM Do YYYY, h:mm:ss a'),

  //               // 判断是否是第一页，并把请求的页数转换成 number 类型
  //   const page = req.query.p ? parseInt(req.query.p) : 1,
  //     outThis = this

  //   const p = new Promise(function (resolve, reject) {
  //                   // 查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
  //     outThis.getTen(user_id, page, (err, posts, count) => {
  //       if (err) {
  //         logger.error('some error with getting the 10 personal posts:' + err)
  //                           // next(err);
  //         reject(`Error getting posts: ${err}`)
  //         posts = []
  //       } else {
  //                          // console.log('getPostsByUserId\'s getTen: '+ user_id +posts);
  //         resolve(posts, count)
  //       }
  //     }, undefined, undefined, 'exit_user_id', 'undefined')
  //   })
  //   p.then(function (posts, count) {
  //     fn(posts, count)
  //   })
  //              .catch(function (err) {
  //                  // err.message is for error object
  //                  // Promise chaining allows you to catch errors that may occur in a fulfillment or rejection handler from a previous promise. For example:
  //                logger.debug(err.message ? err.message : err)
  //                req.flash('error', 'No such user!')
  //                res.redirect('back')
  //              })
  // },


        // getSitesByUserId:  function(req,res,user_id,path){
        //     //const user_created_at = moment(req.user.created_at).format('MMMM Do YYYY, h:mm:ss a'),

        //         //判断是否是第一页，并把请求的页数转换成 number 类型
        //        const page = req.query.p ? parseInt(req.query.p) : 1,
        //              outThis = this;
        //        let loginedUser;
        //        const user = req.user;
        //        if(user){
        //          loginedUser = user.processUser(user);
        //        }
            
        //         let weeklyRec = Project.findOne({weeklyRecommend: true}).exec();

                 



        //         // res.render(path, { 
        //         //   seo: {
        //         //     title: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}的页面`,//seo.personalPage.title,

        //         //     keywords: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}的页面, 个人页面`,//seo.personalPage.keywords,
                    
        //         //     description: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}的个人页面`//seo.personalPage.description,
        //         //   },
        //         //   data: {weeklyRec},
        //         //   user: req.user ? req.user.processUser(req.user) : req.user,
        //         //   //isMyPosts: req.user ? (req.user._id == user_id ? true : false) : false,
        //         //   postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
        //         //   posts: posts,
        //         //   //page: page,
        //         //   //isFirstPage: (page - 1) == 0,
        //         //   //isLastPage: ((page - 1) * 10 + posts.length) == count,                        
        //         //   messages: {
        //         //       error: req.flash('error'),
        //         //       success: req.flash('success'),
        //         //       info: req.flash('info'),
        //         //   }, // get the user out of session and pass to template
        //         // }); 
 


        //        const p = new Promise(function(resolve,reject){
        //             //查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
        //             outThis.getTen(user_id, page, (err, posts, count)=> {
        //                 if (err) {
        //                     logger.error('some error with getting the 10 personal posts:'+ err);
        //                     //next(err);
        //                     reject(`some error with getting the 10 personal posts: ${err}`);
        //                     posts = [];
        //                 }else{
        //                     logger.info('getPostsByUserId\'s getTen: '+ user_id +posts);
        //                     resolve(posts,count);                           

        //                 }
        //            },undefined,undefined,'exit_user_id');

        //        });
        //        p.then(function(posts,count){
        //             userProxy.getUserById(user_id,req,res, theuser=>{ 
                           
        //                       // let weeklyRec = yield Project.findOne({weeklyRecommend: true}).exec();
        //                       res.render(path, { 
        //                         seo: {
        //                           title: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}的页面`,//seo.personalPage.title,

        //                           keywords: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}的页面, 个人页面`,//seo.personalPage.keywords,
                                  
        //                           description: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}的个人页面`//seo.personalPage.description,
        //                         },
        //                         data: {weeklyRec},
        //                         user: req.user ? req.user.processUser(req.user) : req.user,
        //                         isMyPosts: req.user ? (req.user._id == user_id ? true : false) : false,
        //                         postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
        //                         posts: posts,
        //                         page: page,
        //                         isFirstPage: (page - 1) == 0,
        //                         isLastPage: ((page - 1) * 10 + posts.length) == count,                        
        //                         messages: {
        //                             error: req.flash('error'),
        //                             success: req.flash('success'),
        //                             info: req.flash('info'),
        //                         }, // get the user out of session and pass to template
        //                       });  
                          
                              
        //             });
        //        })
        //        .catch(function(err){
        //           console.log(err.message);
        //           req.flash('error','Error finding the user!');
        //           res.redirect('back');
        //        });
            
  
        // },










        /**
         * get 10 posts per page
         * Callback:
         * - err, error
         * - posts, posts per page
         * @param {variable} name
         * @param {Number} page :fetch from the url ..?p=..
         * @param {Function} callback
         */

  // getTen: function (name, page, callback, ...args) {
  //   let query = {}
  //   const globalThis = this
  //   const topicCount = config.list_topic_count
  //   if (name) {
  //     if (args[0]) {
  //       query.tag_id = name
  //     } else if (args[1]) {
  //       query.title = name
  //     } else if (args[2]) {
  //       query.user_id = name
  //     } else if (args[3]) {
  //       query.group_id = name
  //     }
  //                   // console.log(`query[${name}] is`+ Object.keys(query));
  //   }

  //   const getCount = new Promise(function (resolve, reject) {
  //     // 使用 count 返回特定查询的文档数 total
  //     Post.count(query, (err, count) => {
  //       // 根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
  //       if (err) {
  //         // return callback(err);
  //         reject(err)
  //         return
  //       }
  //       logger.debug(`Number of posts: ${count} . query is ${query}`)
  //       resolve(count)
  //     })
  //   })
  //   getCount.then(function (count) {
  //     Post.find(query).skip((page - 1) * topicCount).limit(topicCount).sort({'updated_at': -1}).exec((err, posts) => {
  //       if (err) {
  //         logger.error(`no posts found: ${err}`)
  //         // throw.error('no post found');
  //         res.redirect('/response/error/404')
  //       }
  //                           // console.log('Posts inthe getTen function is: '+posts);

  //                               // console.log('modifiedPosts: '+JSON.stringify(modifiedPosts));
  //                              // let modifiedPosts = globalThis.modifyPosts(posts);

  //       globalThis.modifyPosts(posts, function (newPosts) {
  //         callback(null, newPosts, count)
  //       })

  //                           // for(let i=0,length=posts.length;i<length;i++){

  //                           //     let modifiedPost = posts[i].processPost(posts[i]);
  //                           //     posts[i].comments(posts[i]._id,function(comments){
  //                           //         modifiedPost.comments = comments;

  //                           //         posts[i].group(posts[i].group_id,function(group){
  //                           //             modifiedPost.group = group;

  //                           //         });

  //                           //     });

  //                           // }

  //                          // callback(null,posts,count);

  //                           // callback(null, modifiedPosts, count);

  //                           // .catch(function(err){
  //                           //     logger.debug('err when using modifyPosts in getTen func '+err);
  //                           //     res.redirect('back');
  //                           // });
  //                           // console.log('modifiedPosts: '+modifiedPosts);

  //                           //    let myPosts = [];

  //                           //    posts.forEach(function(post){

  //                           //       let modifyPost = new Promise(function(resolve,reject){
  //                           //           globalThis.modifyPost(post,function(apost){
  //                           //               resolve(apost);
  //                           //           });
  //                           //       });
  //                           //       modifyPost.then(function(apost){
  //                           //           myPosts.push(apost);

  //                           //       }).catch(function(e){
  //                           //           logger.error('error'+ e);
  //                           //       });

  //                           //    });
  //                           //    if(myPosts.length === posts.length){
  //                           //        callback(null, myPosts, count);

  //                           //    }
  //     })
  //   })
  //               .catch(function (err) {
  //                 return callback(err.message ? err.message : err)
  //               })
  //               // Post.find(query,{
  //               //     skip: (page-10)*10,
  //               //     limit:10,
  //               //     sort:{
  //               //        'created_at':-1
  //               //     },
  //               // },function。。);
  // },

        // getPostsByTagId: fuction(tag_id,callback){
        //     Post.find({'tag_id': tag_id},function(err,posts){

        //     });
        // },

        /**
         * get post by id.return a promise
         * @param {String} id
         */
  // getSiteById: function (id) {
  //   if (!id) {
  //     req.flash('error', 'No id exsit！')
  //     res.redirect('back')
  //   } else {
  //     const findPost = new Promise(function (resolve, reject) {
  //       Post.findById(id, function (err, post) {
  //         if (err) {
  //           logger.error(`something wrong when getPostById:${err}`)
  //           reject(err)
  //         } else {
  //                                   // setting view times
  //           resolve(post.processPost(post))
  //         }
  //       })
  //     }) // findPost
  //     return findPost
  //   }// else
  // },





}
