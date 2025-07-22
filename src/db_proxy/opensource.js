'use strict'
const Open = require('../models/OpenSource'),
  userProxy = require('./user'),
  xss = require('xss'),
  config = require('../common/get-config'),
  util = require('../libs/utility'),
  logger = require('../libs/logger');

const Category = require('../models/OpenSourceCategory');
const Subcategory = require('../models/OpenSourceSubcategory');

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
    let modifiedPost = post.processOpen(post)
    cb(modifiedPost)
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
        
        p.then(function(products,count){
          userProxy.getUserById(user_id,req,res, theuser=>{ 
                    // let weeklyRec = yield Project.findOne({weeklyRecommend: true}).exec();
                    res.render(path, { 
                      layout: 'new',
                      seo: {
                        title: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s Page`,//seo.personalPage.title,

                        keywords: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s Page, personal page`,//seo.personalPage.keywords,
                        
                        description: `${(req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser).username}'s Page`//seo.personalPage.description,
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
         * - posts, posts per page
         * @param {Object} query
         * @param {Object} sort
         * @param {Number} page :fetch from the url ..?p=..
         * @param {args}   args['0'] is for country if the query is about filter countries
         */
  getTenAsync: async function (query,sort, page, ...args){
    let isLastPage;
    try {
      const topicCount = config.list_topic_count;
      // 获取文章总数
      const count = await Open.countDocuments(query).exec();

      // 获取指定页的文章列表
      const products = await Open.find(query)
      .skip((page - 1) * topicCount)
      .limit(topicCount)
      .sort(sort)
      .exec();
      
      // 修改站点信息（假设 modifySites 是一个已定义的函数）
      const newProducts = await this.modifySitesAsync(products);
      
      isLastPage = ((page - 1) * topicCount + newProducts.length) >= count;

      // // 执行回调函数
      // callback(null, newPosts, count);
      return {
        products: newProducts,
        count,
        isLastPage,
        error: {}
      };

      } catch (err) {
      // 错误处理
      logger.error(`Error fetching posts: ${err}`);
      return {
        products:[],
        count: 0,
        isLastPage,
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
      Open.find().sort(sort).count(query, (err, count) => {
        // 根据 query 对象查询，并跳过前 (page-1)*10 个结果，返回之后的 10 个结果
        if (err) {
          // return callback(err);
          reject(err)
          return
        }
        resolve(count)
      })
    });
    getCount.then(function (count) {

      Product.find(query).skip((page - 1) * topicCount).limit(topicCount).sort(sort).exec((err, posts) => {
          if (err) {
            logger.error(`no posts found: ${err}`)
            // throw.error('no post found');
            res.redirect('/response/error/404')
          }
          logger.debug('into getTen->getPostsFun')
          globalThis.modifySites(posts, function (newPosts) {
              callback(null, newPosts, count)
            })
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
                        Open.findOne({'tertiaryPath': theName},function(err,site){
                                if (err) {
                                    reject(err);
                                } else {
                                    //setting view times
                                    var conditions = { 'tertiaryPath': theName },
                                        update = { $inc: { 'pv': 1 }};//increment
                                    Open.findOneAndUpdate(conditions, update, function(err,site){
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
                  if(site && site.title){
                    let newSite = site.processOpen(site);
                    logger.info(`new product: ${JSON.stringify(newSite)}`);

                    // let tagsArr =  newSite.tagsString.split(',');                      

                    let isUpvoted = util.userUpvote(loginedUser,newSite._id,'open');//true or false;              
                   
                 //  let sitetag = await ProductTag.findOne({name: newSite.tagsArray[0]}).populate('posts').limit(3).exec();

                 //if you want to shorten the scope,use subcategory
                 let proCat = await Category.findOne({_id: newSite.categories[0]}).exec();
                 logger.info("proCat category" + JSON.stringify(proCat));

                //  let categoriesObj = [proCat.name,proSubcat.name];
                  if(!proCat){
                    res.redirect('/');
                  }else{
                    //logger.info(`IP Address: ${req.ipInfo.ip} is visiting ${name}..`);
                    //let alternatives = sitetag.posts;
                    let alternatives = await Open.find({subcategories: { $in: newSite.subcategories }}).limit(3).exec();
                    logger.info('alternatives '+ JSON.stringify(alternatives))

                    alternatives = await that.modifySitesAsync(alternatives);
                    alternatives = alternatives.map(function(v){
                      v.tagsArray =  util.stringToArray(v.tagsString)
                      v.open = true;
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
                          title: `${newSite.title} - Reveiws,Features & Alternatives 2025`,
                          keywords: `${newSite.title} reviews,,${newSite.title} features,${newSite.title} alternatives`,
                          description: util.trimMetaDescription(newSite.intro)
                        },
                        isUpvoted,
                        alternativesThree:selectedItems,
                        user: req.user ? req.user.processUser(req.user) : req.user,
                        product: newSite,
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
            let product =  ProdOpenuct.findOne({'_id': id}).exec();
             return product;
        }catch (err){
             logger.error('find error when getSiteById function' + err)
             return res.render('back');
        }

    },

    saveCategory: async function(req,res,name,Model,ProductModel,product_id,kind){
      try{
        let category = new Model();
        if(kind == 'category'){ //{catName, subcatName};
          let catName = name.catName;
          category.name = catName;

          let acat = await Model.findOne({ name: catName }).exec();
          if (acat) {  //already exist
            logger.debug('category exist...'); 
            await Model.findOneAndUpdate({ name: catName }, {$inc: { 'count': 1 }}, {new: true }).exec();//在category中增加数量+1
            // set the new option to true to return the document after update was applied.
            await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: {categories: acat._id}}).exec();
                                       
          } else{
            category.name_changed = util.urlBeautify(catName);
            let cate = await category.save();
            acat = cate;
            await Model.findOneAndUpdate({ name: cate._id }, {$inc: { 'count': 1 }}, {new: true }).exec();//在category中增加数量+1
            //await ProductModel.findOneAndUpdate({"_id": product_id }, {categories: cate._id}).exec();
            await ProductModel.findOneAndUpdate({"_id": product_id }, { $addToSet: { categories:  cate._id } }).exec(); // Use $addToSet to add the category ID
          }

            //add subcateory's name to the category array
            let subcategoriesArr = acat.subcategories;//array
            const subcatName = name.subcatName;
            if(!subcategoriesArr.includes(subcatName)){//如果没有有subcat,加入到category中
              await Model.findOneAndUpdate({ '_id': acat._id }, { $push: { subcategories : subcatName } }, { new: true }).exec();//add subcategory to category
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
            await ProductModel.findOneAndUpdate({"_id": product_id }, {$addToSet: {subcategories: acat._id}}).exec();                      
          } else{
            let cate = await category.save();
            await Model.findOneAndUpdate({ '_id': cate._id }, {$inc: { 'count': 1 } }, { new: true }).exec();
            await ProductModel.findOneAndUpdate({"_id": product_id }, {$addToSet: {subcategories: cate._id}}).exec();
          }

        }


      }catch (err){
        logger.error('Category saving error: ' +  err);
        req.flash('error',`there is some errors when save the category ${JSON.stringify(err)}`);
        res.redirect('back');
      }

  }

}
