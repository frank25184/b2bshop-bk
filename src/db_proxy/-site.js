'use strict'
const Product = require('../models/Site'),
      User = require('../models/User'),
  // ProductTag = require('../models/ProductTag'),
    SiteCategory = require('../models/SiteCategory'),
    SiteStageCategory = require('../models/SiteStageCategory'),

  userProxy = require('./user'),
  // moment = require('moment'),
  // helper = require('../libs/utility'),
  // validator = require('validator'),
  xss = require('xss'),
  config = require('../common/get-config'),
      // co_handle = require('../lib/co-handler'),
  util = require('../libs/utility'),
  logger = require('../libs/logger');



// const asyncErrHandle = require('../common/asyncErrHandle')
// const seo = require('../config/seo');
const Category = require('../models/SiteCategory');
const SiteSubcategory = require('../models/SiteSubcategory');
const Subcategory = require('../models/SiteSubcategory');
module.exports = {
  modifySitesAsync: function (posts) {

        // 这是你请求数据的方法，注意我是用steTimeout模拟的
    let that = this
    function fetchData (post) {
      return new Promise(function (resolve, reject) {
                  // posts.forEach(function(post){
      that.modifySite(post, function (newPost) {
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

  modifySites: function (posts, fn) {

            // 这是你请求数据的方法，注意我是用steTimeout模拟的
    let that = this
    function fetchData (post) {
      return new Promise(function (resolve, reject) {
                    // posts.forEach(function(post){
        that.modifySite(post, function (newPost) {
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
     // logger.debug(respDataArr)
      fn(respDataArr)
    }).catch(function (er) {
      logger.error(`err when using promise in modifiedPosts func: ${er.message ? er.message : er.stack}`)
      throw er;
    })
  },

  modifySite: function (post, cb) {
    let modifiedPost = post.processSite(post)
    cb(modifiedPost)

    // let modifiedComments
    // let getComments = new Promise(function (resolve, reject) {
    //   post.comments(post._id, function (comments) {
    //     resolve(comments)
    //   })
    // })


    // let getAuthorInfo = new Promise(function (resolve, reject) {
    //   User.findOne({_id: post.author}).exec(function(err, usr){
    //     if(err) {
    //         reject(err)
    //     }
    //     resolve(usr)
    //   })
    // })


    // Promise.all([getComments, getAuthorInfo]).then(function (values) {
    //   for (let i = 0; i < values.length; i++) {
    //     modifiedPost.comments = values[0]
    //     modifiedPost.postAuthor = values[1]
    //   }
    //   logger.debug('modifiedPost in modifyPost function' + modifiedPost)
    //   cb(modifiedPost)
    // })
  },
        /**
         * get products by user id
         * p.then(function(posts,count){})
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
        getUpvotedSites:async function(req,res,user_id, path){
              //判断是否是第一页，并把请求的页数转换成 number 类型
        const page = req.query.p ? parseInt(req.query.p) : 1,
        outThis = this;           
        logger.info('req.tabs in fun: '+ JSON.stringify(req.tabs))
        
        let loginedUser = req.user;
        let postUser;
        if(loginedUser){
          loginedUser = loginedUser.processUser(loginedUser);
          loginedUser.username_changed = util.slugify(loginedUser.username);            
        }
        postUser = await User.findById(user_id).exec();
        if(postUser){
          postUser = postUser.processUser(postUser);
          postUser.username_changed = util.slugify(postUser.username);
        }
        // let weeklyRec = Project.findOne({weeklyRecommend: true}).exec();

        //products
        // let products = await Product.find({upvoteUser: user_id}).sort({ 'created_at': -1 }).exec();
        // products = await productProxy.modifySitesAsync(products);

//         Product.find({ upvoteUser: userId }) // Replace 'userId' with the ObjectId of the user
// .populate('upvoteUser') // Optional: if you want to get details of the users who upvoted
// .sort({ 'upvoteCount': -1 }) // Sort by 'upvoteCount' in descending order
// .exec((err, products) => {
// if (err) throw err;
// // 'products' will be an array of product documents sorted by 'upvoteCount'
// console.log(products);
// });

        const p = new Promise(function(resolve,reject){
             //查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
             outThis.getTen({upvoteUser:user_id},{ 'created_at': -1 }, page, (err, posts, count)=> {
                 if (err) {
                     logger.error('some error with getting the 10 personal posts:'+ err);
                     //next(err);
                     reject(`some error with getting the 10 personal posts: ${err}`);
                     posts = [];
                 }else{
                     logger.info('getPostsByUserId\'s getTen: '+ user_id +"posts:" + JSON.stringify(posts)) + 'end posts';
                     resolve(posts,count);                           

                 }
            },undefined,undefined,'exit_user_id');

        });
        
        p.then(async function (products,count){
          userProxy.getUserById(user_id,req,res, theuser=>{ 
                    // let weeklyRec = yield Project.findOne({weeklyRecommend: true}).exec();
                    res.render(path, { 
                      layout: 'new',
                      seo: {
                        title: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s collected AI Apps`,//seo.personalPage.title,

                        keywords: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s collected Page`,//seo.personalPage.keywords,
                        
                        description: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s collected AI Apps.`//seo.personalPage.description,
                      },
                     // data: {weeklyRec},
                     upvotedSites: products,
                     tabs: req.tabs,
                      user: req.user ? req.user.processUser(req.user) : req.user,
                      isMyPosts: req.user ? (req.user._id == user_id ? true : false) : false,
                      postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                      postUserEqual2LoginedUser: req.user ? (req.user._id == user_id.toString() ? true : false) : false,
                      page: page,
                      isFirstPage: (page - 1) == 0,
                      isLastPage: ((page - 1) * 10 + products.length) == count,                        
                      messages: {
                          error: req.flash('error'),
                          success: req.flash('success'),
                          info: req.flash('info'),
                      }, // get the user out of session and pass to template
                    });  
                
                    
          });
     })
     .catch(function(err){
        console.log(err.message);
        req.flash('error','Error finding the user!');
        res.redirect('back');
     });




        },

        getProductsByUserId:  async function(req,res,user_id,path){
          //const user_created_at = moment(req.user.local.created_at).format('MMMM Do YYYY, h:mm:ss a'),

              //判断是否是第一页，并把请求的页数转换成 number 类型
             const page = req.query.p ? parseInt(req.query.p) : 1,
                   outThis = this;
             let loginedUser;
             const user = req.user;
             if(user){
               loginedUser = user.processUser(user);
             }
             // let weeklyRec = Project.findOne({weeklyRecommend: true}).exec();

             //products
            //  let products = await Product.find({user_id: user._id}).exec();
            //  products = await this.modifySitesAsync(products);


             const p = new Promise(function(resolve,reject){
                  //查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
                  outThis.getTen({user_id},{}, page, (err, posts, count)=> {
                      if (err) {
                          logger.error('some error with getting the 10 personal posts:'+ err);
                          //next(err);
                          reject(`some error with getting the 10 personal posts: ${err}`);
                          posts = [];
                      }else{
                          logger.info('getPostsByUserId\'s getTen: '+ user_id +"posts:" + JSON.stringify(posts)) + 'end posts';
                          resolve(posts,count);                           

                      }
                 },undefined,undefined,'exit_user_id');

             });
             p.then(function(products,count){
                  userProxy.getUserById(user_id,req,res, theuser=>{ 
                         
                            // let weeklyRec = yield Project.findOne({weeklyRecommend: true}).exec();
                            res.render(path, { 
                              layout: 'new',
                              seo: {
                                title: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s Page`,//seo.personalPage.title,

                                keywords: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s Page, personal page`,//seo.personalPage.keywords,
                                
                                description: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s Page on WhichDapp.com`//seo.personalPage.description,
                              },
                             // data: {weeklyRec},
                              
                             tabs: req.tabs,
                              user: req.user ? req.user.processUser(req.user) : req.user,
                              isMyProducts: req.user ? (req.user._id == user_id ? true : false) : false,
                              postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                              products: products,
                              page: page,
                              isFirstPage: (page - 1) == 0,
                              isLastPage: ((page - 1) * 10 + products.length) == count,                        
                              messages: {
                                  error: req.flash('error'),
                                  success: req.flash('success'),
                                  info: req.flash('info'),
                              }, // get the user out of session and pass to template
                            });  
                        
                            
                  });
             })
             .catch(function(err){
                console.log(err.message);
                req.flash('error','Error finding the user!');
                res.redirect('back');
             });
          

      },

        /**
         * get 10 posts per page
         * Callback:
         * - err, error
         * - products, isLastPage isFirstPage error count per page
         * return: json
         * @param {Object} query
         * @param {Object} sort
         * @param {Number} page :fetch from the url ..?p=..
         * @param {args}   args['0'] is for country if the query is about filter countries
         */
  getTenAsync: async function (query,sort, page, ...args){
    console.log(`query: ${JSON.stringify(query)}`)
    let isLastPage,isFirstPage;
    try {
      page = Math.max(1, parseInt(page, 10) || 1);

      const topicCount = config.list_topic_count; 
      const count = await Product.countDocuments(query).exec(); 
      const totalPages = Math.ceil(count / topicCount);
      
      const products = await Product.find(query)
        .populate('subcategories')
        .skip((page - 1) * topicCount)
        .limit(topicCount)
        .sort(sort)
        .exec();
        console.log(`page: ${page}, query:${JSON.stringify(query)}; products.length: ${products.length};totalPages:${totalPages} `);
      
      // 精确判断是否为最后一页
      isLastPage = page >= totalPages;
      isFirstPage = (page - 1) == 0;
      // console.log(`isLastPage ${isLastPage}`);
      // 修改站点信息（假设 modifySites 是一个已定义的函数）
      const newProducts = await this.modifySitesAsync(products);
     // logger.info(`newProducts: ${JSON.stringify(newProducts)}`)
      return {
        products: newProducts,
        count,
        isLastPage,
        isFirstPage,
        error: {}
      };

      } catch (err) {
      // 错误处理
      logger.error(`Error fetching posts: ${err}`);
      return {
        products:[],
        count: 0,
        isLastPage,
        isFirstPage,
        error: err
      };
      }
      
  },
  getTen: function (query,sort, page, callback, ...args) {  

    //how to do with globe site????

    //let query = {}
    // logger.debug('into getTen')
    const globalThis = this;
    const topicCount = config.list_topic_count;

    if(args[0] ){// args['0'] is for country
        let args0 = args[0];
        logger.debug(`into args[0]: ${args0}`);
        query.ban = { '$ne': args0 }
        // query.available = undefined;//就国家选择来讲，不需要available，暂时query只用到ban
    }

    const getCount = new Promise(function (resolve, reject) {
      // 使用 count 返回特定查询的文档数 total
      // logger.debug('into getTen->getCount promise')
      Product.find().sort(sort).count(query, (err, count) => {
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

      Product.find(query).skip((page - 1) * topicCount).limit(topicCount).sort(sort).exec((err, posts) => {
          if (err) {
            logger.error(`no posts found: ${err}`)
            // throw.error('no post found');
            res.redirect('/response/error/404')
          }
                              // console.log('Posts inthe getTen function is: '+posts);
  
                                  // console.log('modifiedPosts: '+JSON.stringify(modifiedPosts));
                                 // let modifiedPosts = globalThis.modifyPosts(posts);
          logger.debug('into getTen->getPostsFun')

          // Site.find({"available":"Globe", "decentralized": query.decentralized}).sort(sort).exec((err, globeSites)=>{
          //   posts = globeSites.concat(posts);
          globalThis.modifySites(posts, function (newPosts) {
              callback(null, newPosts, count)
            })
          // });
        //  posts = globeSites.concat(posts); 
  

        })







    })
    .catch(function (err) {
        return callback(err.message ? err.message : err)
    })
  },

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

    /**
    * get product by name.   return a promise
    * @param {String} name
    */
    getSiteByName: async function (req,res,name, path) {
            const that = this;
            name = util.trim(name).toLowerCase();  
            if(!name){
                req.flash('error','Site Name not found!');
                logger.error('Site Name not found!');
                res.redirect('back');
            }else{
                let loginedUser;
                if(req.user){
                    loginedUser = req.user.processUser(req.user);
                }
                logger.info('into getSiteByName');
                let findSite =  function (theName){
                    return new Promise(function(resolve,reject){
                        Product.findOne({'name_changed': theName},function(err,site){
                                if (err) {
                                    reject(err);
                                } else {
                                    //setting view times
                                    var conditions = { 'name_changed': theName },
                                        update = { $inc: { 'pv': 1 }};//increment
                                    Product.findOneAndUpdate(conditions, update, function(err,site){
                                        if(err){
                                            console.log(`there is error when update the pv: ${err}`);
                                            return;
                                        }
                                    });   
                                    resolve(site);                                 
                            
                              }                            
                        });
                    });
                  }

                  let site = await findSite(name);
                  if(site && site.name){
                    let newSite = site.processSite(site);
                    logger.info(`new product: ${JSON.stringify(newSite)}`);

                    // let tagsArr =  newSite.tagsString.split(',');    
                    let siteSubcategories = [];
                    let siteSubcategoryIds = newSite.subcategories;
                    console.log(`siteSubcategoryIds: ${siteSubcategoryIds}`);
                    for(let i =0; i<siteSubcategoryIds.length; i++){
                         let id = siteSubcategoryIds[i];
                         let res =  await SiteSubcategory.findOne({_id: id}).exec();
                         siteSubcategories.push(res);
                    }
                    console.log(`siteSubcategories: ${siteSubcategories}`);
                    

                    let isUpvoted = util.userUpvote(loginedUser,newSite._id,'site');//true or false;
                    newSite.socialLinks = util.getSocialLink(site.socialLinks);  
                    let isDownvoted = util.userDownvote(loginedUser,newSite._id,'site');//true or false; 
                    let isBookmarked = util.userBookmark(loginedUser,newSite._id,'site'); //true or false;

                 //if you want to shorten the scope,use subcategory
                 let proCat = await Category.findOne({_id: newSite.categories[0]}).exec();
                 proCat =  proCat.processCategory(proCat);
                 logger.info("proCat category" + JSON.stringify(proCat));
                //  let proSubcat = await Subcategory.findOne({_id: newSite.subcategories[0]}).exec();
                //  proSubcat = proSubcat.processSubcategory(proSubcat);
                //  logger.info("subproduct category" + JSON.stringify(proSubcat));
                //  let categoriesObj = [proCat.name,proSubcat.name];
                  if(!proCat){
                    res.redirect('/');
                  }else{
                    //logger.info(`IP Address: ${req.ipInfo.ip} is visiting ${name}..`);
                    //let alternatives = sitetag.posts;
                    let alternatives = await Product.find({subcategories: { $in: newSite.subcategories }}).limit(3).exec();
                    logger.info('alternatives '+ JSON.stringify(alternatives))

                    alternatives = await that.modifySitesAsync(alternatives);
                    alternatives = alternatives.map( function(v){
                      v.tagsArray =  util.stringToArray(v.tagsString);
                      v.site = true;
                     // logger.info('v '+ JSON.stringify(v))
                      return v;
                    });
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
                      res.render(path, {
                        seo: {
                          title: `${newSite.name} - Reviews,Features,Pricing & Alternatives 2025`,
                          keywords: `${newSite.name} reviews,${newSite.name} pricing,${newSite.name} features,${newSite.name} alternatives`,
                          description: util.trimMetaDescription(newSite.intro)
                        },
                        isUpvoted,isDownvoted,isBookmarked,
                        alternativesThree:selectedItems,
                        user: req.user ? req.user.processUser(req.user) : req.user,
                        product: newSite,proCat,siteSubcategories,
                        messages: {
                            error: req.flash('error'),
                            success: req.flash('success'),
                            info: req.flash('info'),
                        }, // get the user out of session and pass to template
                      });
                  }

                  }else{
                    res.redirect('/');
                  }
                         // logger.info('site' + JSON.stringify (newSite) );
                           
  
                    

            

                        // site.user(site.user_id,theuser=>{
                        //     site.comments(post._id, function(comments){
                        //       logger.info('into commets function')
                        //             res.render(path, {
                        //                     user: req.user ? req.user.processUser(req.user) : req.user,
                        //                     postUser: req.user ? (req.user._id == post.user_id ? loginedUser : theuser) : theuser,
                        //                     site: newSite,
                        //                     comments: comments,
                        //                     //user_created_at: user_created_at,
                        //                     messages: {
                        //                         error: req.flash('error'),
                        //                         success: req.flash('success'),
                        //                         info: req.flash('info'),
                        //                     }, // get the user out of session and pass to template
                        //             });
                        //     });
        
                        // });
                        console.log("Done");
               


        

     

            }
    },

    getSiteById: async function(req,res,id){
        try{
            let product =  Product.findOne({'_id': id}).exec();
             return product;
        }catch (err){
             logger.error('find error when getSiteById function' + err)
             return res.render('back');
        }

    },

    saveCategory: async function(req,res,name,Model,ProductModel,product_id,kind){
      try{
        let category = new Model();
        if(kind == 'category' || kind=='stageCategory'){ //{catName, subcatName};
          let catName = name.catName;
          category.name = catName;

          let acat = await Model.findOne({ name: catName }).exec();
          if (acat) {  //already exist
            logger.debug('category exist...'); 
            await Model.findOneAndUpdate({ name: catName }, {$inc: { 'count': 1 }}, {new: true }).exec();//在category中增加数量+1
            // set the new option to true to return the document after update was applied.
            if(kind == 'category'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: {categories: acat._id}}).exec();
            }else if(kind == 'stageCategory'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: {stageCategories: acat._id}}).exec();
            }
            
                                       
          } else{
            category.name_changed = util.urlBeautify(catName);
            let cate = await category.save();
            acat = cate;
            await Model.findOneAndUpdate({ name: cate._id }, {$inc: { 'count': 1 }}, {new: true }).exec();//在category中增加数量+1
            //await ProductModel.findOneAndUpdate({"_id": product_id }, {categories: cate._id}).exec();
           if(kind == 'category'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: {categories: cate._id}}).exec();
            }else if(kind == 'stageCategory'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: {stageCategories: cate._id}}).exec();
            }
          }
            //add subcateory's name to the category array
            let subcategoriesArr = acat.subcategories;//array
            const subcatName = name.subcatName;
            if(!subcategoriesArr.includes(subcatName)){//如果没有有subcat,加入到category中
              await Model.findOneAndUpdate({ '_id': acat._id }, { $push: { subcategories : subcatName } }, { new: true }).exec();//add subcategory to category
            }

        }else if(kind == 'subcategory' || kind=='stageSubcategory'){
          let catName = name.subcatName;
          category.name = catName;
          category.name_changed = util.urlBeautify(catName);
          let acat = await Model.findOne({ name: catName }).exec();
          if (acat) {  //already exist
            logger.debug('subcategory exist...'); 
            await Model.findOneAndUpdate({ name: catName }, {$inc: { 'count': 1 }}, {new: true }).exec();
            // set the new option to true to return the document after update was applied.
             
            if(kind == 'subcategory'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, {$addToSet: {subcategories: acat._id}}).exec();  
            }else if(kind == 'stageSubcategory'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: {stageSubcategories: acat._id}}).exec();
            }            
            
          } else{
            let cate = await category.save();
            await Model.findOneAndUpdate({ '_id': cate._id }, {$inc: { 'count': 1 } }, { new: true }).exec();
            if(kind == 'subcategory'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, {$addToSet: {subcategories: cate._id}}).exec();  
            }else if(kind == 'stageSubcategory'){
              await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: {stageSubcategories: cate._id}}).exec();
            }              
          }

        }


      }catch (err){
        logger.error('Category saving error: ' +  err);
        req.flash('error',`there is some errors when save the category ${JSON.stringify(err)}`);
        res.redirect('back');
      }

    },

    getUpvotedProducts:async function(req,res,user_id, path){
        //判断是否是第一页，并把请求的页数转换成 number 类型
        const page = req.query.p ? parseInt(req.query.p) : 1,
        outThis = this;           
        logger.info('req.tabs in fun: '+ JSON.stringify(req.tabs))

        let loginedUser;
        const user = req.user;
        if(user){
          loginedUser = user.processUser(user);
        }
        const p = new Promise(function(resolve,reject){
            //查询并返回第 page 页的 10 篇文章  tag_id,title,user_id
            outThis.getTen({upvoteUser:user_id},{ 'created_at': -1 }, page, (err, posts, count)=> {
                if (err) {
                    logger.error('some error with getting the 10 personal posts:'+ err);
                    //next(err);
                    reject(`some error with getting the 10 personal posts: ${err}`);
                    posts = [];
                }else{
                    logger.info('getPostsByUserId\'s getTen: '+ user_id +"posts:" + JSON.stringify(posts)) + 'end posts';
                    resolve(posts,count);                           

                }
            },undefined,undefined,'exit_user_id');

        });

        p.then(function(products,count){
          userProxy.getUserById(user_id,req,res, theuser=>{ 
                
                    // let weeklyRec = yield Project.findOne({weeklyRecommend: true}).exec();
                    res.render(path, { 
                      layout: 'new',
                      seo: {
                        title: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s AI Apps Page`,//seo.personalPage.title,

                        keywords: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s AI Apps Page`,//seo.personalPage.keywords,
                        
                        description: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s AI Apps Page`//seo.personalPage.description,
                      },
                    // data: {weeklyRec},
                    upvotedProducts: products,
                    tabs: req.tabs,
                      user: req.user ? req.user.processUser(req.user) : req.user,
                      isMyPosts: req.user ? (req.user._id == user_id ? true : false) : false,
                      postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
                      page: page,
                      isFirstPage: (page - 1) == 0,
                      isLastPage: ((page - 1) * 10 + products.length) == count,                        
                      messages: {
                          error: req.flash('error'),
                          success: req.flash('success'),
                          info: req.flash('info'),
                      }, // get the user out of session and pass to template
                    });  
                
                    
          });
        })
        .catch(function(err){
        console.log(err.message);
        req.flash('error','Error finding the user!');
        res.redirect('back');
        });
    },
    
    getCategoryIdByName: async (name, Model) => {
      try {
        const category = await Model.findOne({ name_changed: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') });
        return category ? category._id : null;
      } catch (error) {
        console.error(`Error looking up category '${name}':`, error);
        return null;
      }
    }



}
