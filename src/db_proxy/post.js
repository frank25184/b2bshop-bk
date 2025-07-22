'use strict'
const User = require('../models/User'),
  Post = require('../models/Post'),
  PostCategory = require('../models/PostCategory'),
  PostTag = require('../models/PostTag'),
  Comment = require('../models/Comment'),
  Product = require('../models/Product'),
  ProductCategory = require('../models/Category'),
  userProxy = require('../db_proxy/user'),
  productProxy = require('../db_proxy/product'),
  moment = require('moment'),
  util = require('../libs/utility'),
  validator = require('validator'),
  xss = require('xss'),
  config = require('../common/get-config'),
      // co_handle = require('../lib/co-handler'),
  logger = require('../libs/logger');

const asyncErrHandle = require('../common/asyncErrHandle')
const seo = require('../config/seo');
module.exports = {

  modifyPostsAsync: function (posts) {

      // 这是你请求数据的方法，注意我是用steTimeout模拟的
    let that = this
    function fetchData (post) {
      return new Promise(function (resolve, reject) {
                  // posts.forEach(function(post){
      that.modifyPost(post, function (newPost) {
        resolve(newPost)
      })
                  // });
      })
    }

        // 用数组里面的元素做请求，去获取响应数据
    var promiseArr = posts.map(function (thepost) {
      return fetchData(thepost)
    })

    return  Promise.all(promiseArr)
  },

  modifyPosts: function (posts, fn) {
            // 异步并发
            // 这是你请求数据的方法，注意我是用steTimeout模拟的
    let that = this
    function fetchData (post) {
      return new Promise(function (resolve, reject) {
                    // posts.forEach(function(post){
        that.modifyPost(post, function (newPost) {
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

  modifyPost: function (post, cb) {
    let modifiedPost = post.processPost(post)

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
      logger.debug('modifiedPost in modifyPost function' + modifiedPost)
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
  getPostsByUserId: function (req, res, user_id, fn) {
              const user_created_at = moment(req.user.local.created_at).format('MMMM Do YYYY, h:mm:ss a');

                 // 判断是否是第一页，并把请求的页数转换成 number 类型
  
                    const page = req.query.p ? parseInt(req.query.p) : 1,
       outThis = this

     const p = new Promise(function (resolve, reject) {
       // 查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
       outThis.getTen(user_id, page, (err, posts, count) => {
         if (err) {
           logger.error('some error with getting the 10 personal posts:' + err)
                              next(err);
           reject(`Error getting posts: ${err}`)
           posts = []
         } else {
                             console.log('getPostsByUserId\'s getTen: '+ user_id +posts);
           resolve(posts, count)
         }
       }, undefined, undefined, 'exit_user_id', 'undefined')
     })
     p.then(function (posts, count) {
       fn(posts, count)
     })
                .catch(function (err) {
                   //  err.message is for error object
                   //  Promise chaining allows you to catch errors that may occur in a fulfillment or rejection handler from a previous promise. For example:
                  logger.debug(err.message ? err.message : err)
                  req.flash('error', 'No such user!')
                 res.redirect('back')
               })
  },

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
         * @param {Object} query
         * @param {Object} sort
         * @param {Number} page :fetch from the url ..?p=..
         * @param {args}   args['0'] is for country if the query is about filter countries
         */
        getTenAsync: async function (query,sort, page, ...args){
          let isLastPage,isFirstPage;
          try {
            const topicCount = config.list_topic_count;
            // 获取文章总数
            const count = await Post.countDocuments(query).exec();
            console.log('count',count);
            let posts;
            if(args[0] == 'populated categories'){
              posts = await Post.find(query).populate('author').populate('subcategory').populate('category')
              .skip((page - 1) * topicCount)
              .limit(topicCount)
              .sort(sort)
              .exec();
            }else{
            posts = await Post.find(query)
            .skip((page - 1) * topicCount)
            .limit(topicCount)
            .sort(sort)
            .exec();
            }
            // 修改站点信息（假设 modifySites 是一个已定义的函数）
            const newPosts = await this.modifyPostsAsync(posts);
            isLastPage = ((page - 1) * topicCount + newPosts.length) >= count;
            isFirstPage = (page - 1) == 0;
            // // 执行回调函数
            // callback(null, newPosts, count);
            return {
              posts: newPosts,
              count,
              isLastPage,
              isFirstPage,
              error: {}
            };
      
            } catch (err) {
            // 错误处理
            logger.error(`Error fetching posts: ${err}`);
            return {
              posts:[],
              count: 0,
              isLastPage,
              isFirstPage,
              error: err
            };
            }
            
        },
        /**
         * get 10 posts per page
         * Callback:
         * - err, error
         * - posts, posts per page
         * @param {Object} query
         * @param {Object} sort
         * @param {Number} page :fetch from the url ..?p=..
         * @param {Function} callback
         * @param {args}   args['0'] is for country if the query is about filter countries
         */

        getTen: function (query,sort, page, callback, ...args) {  

          //how to do with globe site????
      
          //let query = {}
          // logger.debug('into getTen')
          const globalThis = this;
          const topicCount = config.list_topic_count;
      
          
          // if(args[0] ){// args['0'] is for country
          //     let args0 = args[0];
          //     logger.debug(`into args[0]: ${args0}`);
          //     query.ban = { '$ne': args0 }
          //     // query.available = undefined;//就国家选择来讲，不需要available，暂时query只用到ban
          // }
      
      
          const getCount = new Promise(function (resolve, reject) {
            // 使用 count 返回特定查询的文档数 total
            // logger.debug('into getTen->getCount promise')
            Post.find().sort(sort).count(query, (err, count) => {
              // 根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
              if (err) {
                // return callback(err);
                reject(err)
                return
              }
      
              // Site.find({"available":"Globe", "decentralized": query.decentralized}).count((err, globeCount)=>{
              // count = count + globeCount;
                     resolve(count)
              // });
              
            })
          });
          getCount.then(function (count) {
      
              Post.find(query).skip((page - 1) * topicCount).limit(topicCount).sort(sort).exec((err, posts) => {
                if (err) {
                  logger.error(`no posts found: ${err}`)
                  // throw.error('no post found');
                  res.redirect('/response/error/404')
                }
               // logger.info('Posts inthe getTen function is: '+ JSON.stringify(posts));
        
                                        // console.log('modifiedPosts: '+JSON.stringify(modifiedPosts));
                                       // let modifiedPosts = globalThis.modifyPosts(posts);
                logger.debug('into getTen->getPostsFun')
      
                // Site.find({"available":"Globe", "decentralized": query.decentralized}).sort(sort).exec((err, globeSites)=>{
                //   posts = globeSites.concat(posts);
                globalThis.modifyPosts(posts, function (newPosts) {
                    callback(null, newPosts, count)
                  })
                // });
              //  posts = globeSites.concat(posts); 
              })
      
          }).catch(function (err) {
              logger.error(`getCount.then func error: ${err}`)
              err = err.message ? err.message : err;
              return callback(err)
          })
        },

  /**
   * get 10 posts per page
   * Callback:
   * - err, error
   * - posts, posts per page
   * param {variable} name
   * param {Number} page :fetch from the url ..?p=..
   * param {Function} callback
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

  //       globalThis.modifyPosts(posts, function (newPosts) {
  //         callback(null, newPosts, count)
  //       })
  //     })
  //   })
  //               .catch(function (err) {
  //                 return callback(err.message ? err.message : err)
  //               })
  // },


        /**
         * get post by id.return a promise
         * @param {String} id
         */
  getPostById: function (id) {
    if (!id) {
      req.flash('error', 'No id exsit！')
      res.redirect('back')
    } else {
      const findPost = new Promise(function (resolve, reject) {
        Post.findById(id, function (err, post) {
          if (err) {
            logger.error(`something wrong when getPostById:${err}`)
            reject(err)
          } else {
                                    // setting view times
            resolve(post.processPost(post))
          }
        })
      }) // findPost
      return findPost
    }// else
  },

    /**
    * get post by title.return a promise
    * @param {String} title
    */
    getPostByPathName:  async function (req,res,pathName,path) {
            if(!pathName){
                req.flash('error','pathName not existing or is null/undefined');
                res.redirect('back');
            }else{
                 logger.info('pathName: '+pathName)

                let loginedUser,isAdmin;
                if(req.user){
                    loginedUser = req.user.processUser(req.user);
                    isAdmin = loginedUser.admin;
                }

                logger.info('into getPostByPathName')
                logger.info('into async')
                let findPost = function(thePathName) {
                  return new Promise(function(resolve, reject) {
                    Post.findOne({ 'pathName': thePathName })
                      .populate('category', 'name')  // Populate category with name and slug
                      .populate('author', 'username')  // Optionally populate author
                      .exec(function(err, post) {
                        if (err) {
                          reject(err);
                        } else {
                          // Update view count
                          Post.findOneAndUpdate(
                            { 'pathName': thePathName },
                            { $inc: { 'pv': 1 }},
                            { new: true }
                          ).exec();  // We don't need to wait for this to complete
                          
                          resolve(post);
                        }
                      });
                  });
                };                
                // let findPost =  function (theTitle){
                //     return new Promise(function(resolve,reject){
                //         Post.findOne({'title_changed': theTitle},function(err,post){
                //                 if (err) {
                //                     reject(err);
                //                 } else {
                //                     //setting view times
                //                     var conditions = { 'title_changed': title },
                //                         update = { $inc: { 'pv': 1 }};//increment
                //                     Post.findOneAndUpdate(conditions, update, function(err,post){
                //                         if(err){
                //                             console.log(`there is error when update the pv: ${err}`);
                //                             return;
                //                         }
                //                     });   
                //                     resolve(post);                                 
                            
                //               }                            
                //         });
                //     });
                //   }

                  let post = await findPost(pathName);
                  if(post){
                      let newPost = post.processPost(post);
                      logger.info('post' + JSON.stringify (newPost) );

                      let ownArticles = await Post.find({user_id: newPost.user_id}).limit(3).exec();
                      ownArticles = await this.modifyPostsAsync(ownArticles);

                     // let tasArray = newPost.tagsArray
                      
                      //var randomIndex = Math.floor(Math.random() * tasArray.length); 
                      let categoryId = newPost.category;//id
                      // var randomValue = tasArray[randomIndex] ? tasArray[randomIndex].trim() : '';
                      // logger.info(`tasArray[0]: ${tasArray[0]},   randomValue: ${randomValue}`)

                      // let posttag = await PostTag.findOne({name: randomValue}).populate('posts').limit(4).exec();
                      let categoryPosts = await Post.find({category: categoryId}).limit(4).exec();
                     
                      let postCategoryName = post.category.name;//前提article的category和Product的category name一样。
                      let productCategory = await ProductCategory.findOne({name: postCategoryName}).exec();
                     let products = await Product.find({categories: productCategory._id}).limit(4).exec();
                     if(products.length){
                      products = await productProxy.modifySitesAsync(products);
                     }else{
                      products = await Product.find({hidden:false}).limit(4).exec();
                     }
                     
                        if(!categoryPosts){
                          logger.info(`categoryPosts not exit!`)
                          res.redirect('/');
                        }else{
                                let alternatives = categoryPosts;
                                alternatives = await  this.modifyPostsAsync(alternatives);
                                // alternatives = alternatives.map(function(v){
                                //   v.tagsArray =  util.stringToArray(v.tagsString)
                                //   return v;
                                // });
  
                              ///   console.log(`alternatives changed: ${JSON.stringify(alternatives)}`)
  
                                //get three random items from an array
                                // Define an empty array to hold the selected items
                                const selectedItems = [];
                                // Check if there are more than 1 items in the `alternatives` array
                                if (alternatives.length >= 3 ) {
                                  // Select three random items from the array
                                  console.log('into alternatives.length >= 3')
                                  while (selectedItems.length < 3) {
                                    const randomIndex = Math.floor(Math.random() * alternatives.length);
                                    const selectedItem = alternatives[randomIndex];
                                    if (!selectedItems.includes(selectedItem)) {
                                      selectedItems.push(selectedItem);
                                    }
                                  }
                                } else if (alternatives.length === 2) {
                                  console.log('into alternatives.length == 2')
                                  while (selectedItems.length < 2) {
                                    const randomIndex = Math.floor(Math.random() * alternatives.length);
                                    const selectedItem = alternatives[randomIndex];
                                    if (!selectedItems.includes(selectedItem)) {
                                      selectedItems.push(selectedItem);
                                    }
                                  }
                                }
                                  else if (alternatives.length === 1) {
                                  console.log('into alternatives.length == 1')
                                  selectedItems.push(alternatives[0]);
                                }


                                post.user(post.user_id,theuser=>{
                                  post.comments(post._id, function(comments){
                                    logger.info('into commets function')
                                          res.render(path, {
                                                  seo: {
                                                    title: post.seoTitle,
                                                    keywords: post.seoKeywords,
                                                    description: post.seoDescription
                                                  },
                                                  isAdmin,
                                                  user: req.user ? req.user.processUser(req.user) : req.user,
                                                  alternativesFour:selectedItems,
                                                  ownArticles: ownArticles,
                                                  productCategory,
                                                  postUser: req.user ? (req.user._id == post.user_id ? loginedUser : theuser) : theuser,
                                                  article: newPost,
                                                  products,
                                                  comments: comments,
                                                  //user_created_at: user_created_at,
                                                  messages: {
                                                      error: req.flash('error'),
                                                      success: req.flash('success'),
                                                      info: req.flash('info'),
                                                  }, // get the user out of session and pass to template
                                          });
                                  });
              
                              });
                              console.log("Done");
                        }
                  }else{
                    //res.render(path)
                   res.redirect('/');
                  }

            }
    },

    saveCategory: async function(req,res,name,Model,ProductModel,product_id,kind){
      try{
        let category = new Model();
        if(kind == 'category'){ //{catName, subcatName};
          let catName = name.catName;
          category.name = catName;
          category.name_changed = util.urlBeautify(catName);
  

          let acat = await Model.findOne({ name: catName }).exec();
          if (acat) {  //already exist
            logger.debug('category exist...'); 
            let subcategoriesArr = acat.subcategories;//array
            if(!subcategoriesArr.includes(name.subcatName)){//如果没有有subcat,加入到category中
              await Model.findOneAndUpdate({ '_id': acat._id }, { $push: { 'subcategories': name.subcatName } }, { new: true }).exec();//add subcategory to category
            }
            await Model.findOneAndUpdate({ name: catName }, {$inc: { 'count': 1 }}, {new: true }).exec();//在category中增加数量+1
            // set the new option to true to return the document after update was applied.
            await ProductModel.findOneAndUpdate({"_id": product_id }, {category: acat._id}).exec();
                                       
          } else{
            let cate = await category.save();
            await Model.findOneAndUpdate({ '_id': cate._id }, { $push: { 'subcategories': name.subcatName } }, { new: true }).exec();//add subcategory to category
            await ProductModel.findOneAndUpdate({"_id": product_id }, {category: cate._id}).exec();
          }

        }else if(kind == 'subcategory'){
          let catName = name.subcatName;
          category.name = catName;
          category.name_changed = util.urlBeautify(catName);

          let acat = await Model.findOne({ name: catName }).exec();
          if (acat) {  //already exist
            logger.debug('subcategory exist...'); 
            await Model.findOneAndUpdate({ name: catName }, {$inc: { 'count': 1 }}, {new: true }).exec();
            // set the new option to true to return the document after update was applied.
            await ProductModel.findOneAndUpdate({"_id": product_id }, {subcategory: acat._id}).exec();                      
          } else{
            let cate = await category.save();
            await Model.findOneAndUpdate({ '_id': cate._id }, {$inc: { 'count': 1 } }, { new: true }).exec();
            await ProductModel.findOneAndUpdate({"_id": product_id }, {subcategory: cate._id}).exec();
          }

        }


      }catch (err){
        logger.error('Category saving error: ' +  err);
        req.flash('error',`there is some errors when save the category ${JSON.stringify(err)}`);
        res.redirect('back');
      }

  },
  // updateCategorySaved: async function(req, res, newCategory, Model, ProductModel, product_id, kind, oldCategoryId = null) {
  //   try {
  //     // 获取当前文章信息
  //     const post = await ProductModel.findById(product_id).populate('subcategory').exec();
  //     if (!post) {
  //       throw new Error('Post not found');
  //     }

  //     // 保存新分类
  //   //  await this.saveCategory(req, res, newCategory, Model, ProductModel, product_id, kind);

  //     // 如果提供了旧分类ID，则处理旧分类
  //     if (oldCategoryId) {
  //       // 减少旧分类的计数
  //       await Model.findByIdAndUpdate(
  //         oldCategoryId, 
  //         { $inc: { count: -1 } }, 
  //         { new: true }
  //       ).exec();

  //     //  if (kind === 'category' && post.subcategory) {
  //     //     // 如果是更新主分类，且原文章有子分类，从旧分类中移除该子分类
  //     //     await Model.findByIdAndUpdate(
  //     //       oldCategoryId,
  //     //       { $pull: { subcategories: post.subcategory.name } },
  //     //       { new: true }
  //     //     ).exec();
  //     //   }
  //     }

  //     return { success: true };
  //   } catch (err) {
  //     logger.error('Category updating error: ' + err);
  //     req.flash('error', `There were some errors when updating the category: ${err.message}`);
  //     res.redirect('back');
  //     return { success: false, error: err };
  //   }
  // }
}
