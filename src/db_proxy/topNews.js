'use strict'
const TopCategory = require('../models/TopCategory'),
  TopSubcategory = require('../models/TopSubcategory'),
  TopNews = require('../models/TopNews'),
  TopNewsCategory = require('../models/TopNewsCategory'),
  Top = require('../models/Top'),
  Site = require('../models/Site'),
  Gadget = require('../models/Product'),
  Prompt = require('../models/Prompt'),
  Open = require('../models/OpenSource'),
  userProxy = require('./user'),
  // moment = require('moment'),
  // helper = require('../libs/utility'),
  // validator = require('validator'),
  xss = require('xss'),
  config = require('../common/get-config'),
      // co_handle = require('../lib/co-handler'),
  util = require('../libs/utility'),
  logger = require('../libs/logger');


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
            })
          }

              // 用数组里面的元素做请求，去获取响应数据
          var promiseArr = posts.map(function (thepost) {
            return fetchData(thepost)
          })

        return  Promise.all(promiseArr)
        },
        modifySites: function (posts, fn) {
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
          var promiseArr = posts.map(function (thepost) {
            return fetchData(thepost)
          })
          Promise.all(promiseArr).then(function (respDataArr) {
            fn(respDataArr)
          }).catch(function (er) {
            logger.error(`err when using promise in modifiedPosts func: ${er.message ? er.message : er.stack}`)
            throw er;
          })
        },
        modifySite: function (post, cb) {
          let modifiedPost = post.processTop(post)
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
      const count = await TopNews.countDocuments(query).exec();

      // 获取指定页的文章列表
      const topNews = await TopNews.find({query})
      .skip((page - 1) * topicCount)
      .limit(topicCount)
      .sort(sort)
      .exec();
      
      // 修改站点信息（假设 modifySites 是一个已定义的函数）
      const newTop = await this.modifySitesAsync(topNews);
      
      isLastPage = ((page - 1) * topicCount + newTop.length) >= count;

      // // 执行回调函数
      // callback(null, newPosts, count);
      return {
        tops: newTop,
        count,
        isLastPage,
        error: {}
      };

      } catch (err) {
      // 错误处理
      logger.error(`Error fetching posts: ${err}`);
      return {
        tops:[],
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
      Top.find().sort(sort).count(query, (err, count) => {
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

      Top.find(query).skip((page - 1) * topicCount).limit(topicCount).sort(sort).exec((err, posts) => {
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
    * get product by name.   return a promise
    * @param {String} name
    */
    getTopByTitle: async function (req,res,title, path) {
            const that = this;
            title = util.trim(title).toLowerCase();  
            if(!title){
                req.flash('error','Title not existing');
                res.redirect('back');
            }else{
                let loginedUser;
                if(req.user){
                    loginedUser = req.user.processUser(req.user);
                }
                logger.info('into getSiteBytitle');
                let findSite =  function (tertiaryPath){
                    return new Promise(function(resolve,reject){
                      TopNews.findOne({tertiaryPath},function(err,top){
                                if (err) {
                                    reject(err);
                                } else {
                                    //setting view times
                                    var conditions = {tertiaryPath },
                                        update = { $inc: { 'pv': 1 }};//increment
                                        TopNews.findOneAndUpdate(conditions, update, function(err,top){
                                        if(err){
                                          console.log(`there is error when update the pv: ${err}`);
                                            return;
                                        }
                                    });   
                                    resolve(top);                                 
                              }                            
                        });
                    });
                  }
                  let top = await findSite(title);
                  if(top && top.title){
                    let newTop = top.processTop(top);
                    logger.info(`new topNews: ${JSON.stringify(newTop)}`);
                    let topArticle1,topArticle2,prompt1,prompt2,open1,open2;
                    if(top.topArticle1){topArticle1 = await Top.findOne({_id: top.topArticle1}).exec();}
                    if(top.topArticle2){
                      topArticle2 = await Top.findOne({_id: top.topArticle2}).exec();
                    }
                    if(top.prompt1){
                      prompt1 = await Prompt.findOne({_id: top.prompt1}).exec();
                    }
                    if(top.prompt2){
                      prompt2 = await Prompt.findOne({_id: top.prompt2}).exec();
                    }
                    if(top.open1){
                      open1 = await Open.findOne({_id: top.open1}).exec();
                    }
                    if(top.open2){
                      open2 = await Open.findOne({_id: top.open2}).exec();
                    }
                    // let tagsArr =  newTop.tagsString.split(',');                      

                    let isUpvoted = util.userUpvote(loginedUser,newTop._id,"top");//true or false;
                    //newTop.socialLinks = util.getSocialLink(top.socialLinks);

                 //if you want to shorten the scope,use subcategory
            // ??????   //  let proCat = await TopCategory.findOne({_id: newTop.category}).exec();
                //  logger.info("proCat category" + JSON.stringify(proCat));
                //  let proSubcat = await Subcategory.findOne({_id: newTop.subcategory}).exec();
                //  logger.info("subproduct category" + JSON.stringify(proSubcat));

                   // logger.info(`IP Address: ${req.ipInfo.ip} is visiting ${title}..`);
                    //let alternatives = sitetag.posts;
                    let alternatives = await TopNews.find({category: newTop.category}).limit(3).exec();
                    logger.info('alternatives '+ JSON.stringify(alternatives))

                    alternatives = await that.modifySitesAsync(alternatives);
                    alternatives = alternatives.map(function(v){
                      v.tagsArray =  util.stringToArray(v.tagsString)
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
                      

                    //  console.log(`into end of limit 3. selectedItems: ${JSON.stringify(selectedItems)}`)
                    //if it is amazon url
                    
                    if(util.isAmazonURL(newTop.buyingUrl)){
                      newTop.isAmazonURL = true;
                    }
                    let isArticle = newTop.outTop1_title || topArticle1 ? true : false;
                    let topCreatedAt = new Date(top.created_at).getTime();
                    let sevenDaysBeforeInMs = topCreatedAt - (7 * 24 * 60 * 60 * 1000);
                    // console.log(`Using ms - $gte:${new Date(sevenDaysBeforeInMs)} $lte: ${new Date(topCreatedAt)}`);
                    let toolsThisWeek = await Site.find({
                      created_at: {
                        $gte: new Date(sevenDaysBeforeInMs),
                        $lte: new Date(topCreatedAt)
                      },
                      hidden: false
                     })
                    .sort({ created_at: -1 })
                    .select('name name_changed imgs seoDescription')
                    .limit(8)
                    .exec();
                    res.render(path, {
                        seo: {
                          title: `${newTop.seoTitle}`,
                          keywords: `${newTop.seoTitle}`,
                          description: util.trimMetaDescription(newTop.seoDescription)
                        },
                        topArticle1,topArticle2,prompt1,prompt2,open1,open2,isArticle,
                        isUpvoted,toolsThisWeek,
                        alternativesThree:selectedItems,
                        user: req.user ? req.user.processUser(req.user) : req.user,
                        // postUser: req.user ? (req.user._id == site.user_id ? loginedUser : theuser) : theuser,
                        top: newTop,
                        messages: {
                            error: req.flash('error'),
                            success: req.flash('success'),
                            info: req.flash('info'),
                        }, // get the user out of session and pass to template
                      });
                  }else{
                    res.redirect('/');
                  }
                         // logger.info('site' + JSON.stringify (newTop) );
                        // site.user(site.user_id,theuser=>{
                        //     site.comments(post._id, function(comments){
                        //       logger.info('into commets function')
                        //             res.render(path, {
                        //                     user: req.user ? req.user.processUser(req.user) : req.user,
                        //                     postUser: req.user ? (req.user._id == post.user_id ? loginedUser : theuser) : theuser,
                        //                     site: newTop,
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
            let product =  Top.findOne({'_id': id}).exec();
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
          category.name_changed = util.urlBeautify(catName);
          let acat = await Model.findOne({ name: catName }).exec();
          if (acat) {  //already exist
            logger.debug('category exist...'); 
            await Model.findOneAndUpdate({ name: catName }, {$inc: { 'count': 1 }}, {new: true }).exec();//在category中增加数量+1
            // set the new option to true to return the document after update was applied.
            await ProductModel.findOneAndUpdate({"_id": product_id }, {category: acat._id}).exec();
                                       
          } else{
            let cate = await category.save();
            await Model.findOneAndUpdate({ name: catName }, {$inc: { 'count': 1 }}, {new: true }).exec();//在category中增加数量+1
            // set the new option to true to return the document after update was applied.
            await ProductModel.findOneAndUpdate({"_id": product_id }, {category: cate._id}).exec();
          }

        }


      }catch (err){
        logger.error('Category saving error: ' +  err);
        req.flash('error',`there is some errors when save the category ${JSON.stringify(err)}`);
        res.redirect('back');
      }

  }

}
