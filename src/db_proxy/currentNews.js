const logger = require('../libs/logger');
config = require('../common/get-config');
const CurrentNews = require('../models/CurrentNews');
const util = require('../libs/utility');
const TextSummarizer = require('../ai/text-summarizer');//class
const crawler = require('../crawling/crawl-page');
require('dotenv').config()

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
    let modifiedPost = post.processNews(post)
    cb(modifiedPost)
  },

  getNewsByTitle: async function(req,res,tertiaryPath,path) {
    const that = this;
    tertiaryPath = util.trim(tertiaryPath).toLowerCase();  
    if(!tertiaryPath){
        req.flash('error','new Name not found!');
        logger.error('new Name not found!');
        res.redirect('back');
    }else{
        let loginedUser;
        if(req.user){
            loginedUser = req.user.processUser(req.user);
        }
        logger.info('into getNewsByTitle');
        let findSite =  function (theName){
            //theName = util.unslugify(theName);
            return new Promise(function(resolve,reject){
              CurrentNews.findOne({title_changed: theName},function(err,news){
                        if (err) {
                            reject(err);
                        } else {
                            //setting view times
                            var conditions = { title_changed: theName },
                                update = { $inc: { 'pv': 1 }};//increment
                                CurrentNews.findOneAndUpdate(conditions, update, function(err,news){
                                if(err){
                                    console.log(`there is error when update the pv: ${err}`);
                                    return;
                                }
                            });   
                            resolve(news);                                 
                      }                            
                });
            });
          }

          let news = await findSite(tertiaryPath);
          if(news && news.title){
            let newNews= news.processNews(news);
           // newNews.title_changed = util.slugify(newNews.title);
            logger.info(`new news: ${JSON.stringify(newNews)}`);

            // let tagsArr =  newNews.tagsString.split(',');    
            // let siteSubcategories = [];
            // let siteSubcategoryIds = newNews.subcategories;
            // if(siteSubcategoryIds){
            //   console.log(`siteSubcategoryIds: ${siteSubcategoryIds}`);
            //   for(let i =0; i<siteSubcategoryIds.length; i++){
            //        let id = siteSubcategoryIds[i];
            //        let res =  await SiteSubcategory.findOne({_id: id}).exec();
            //        siteSubcategories.push(res);
            //   }
            //   console.log(`siteSubcategories: ${siteSubcategories}`);
            // }

            

            // let isUpvoted = util.userUpvote(loginedUser,newNews._id,'site');//true or false;
            // let isDownvoted = util.userDownvote(loginedUser,newNews._id,'site');//true or false; 
            // let isBookmarked = util.userBookmark(loginedUser,newNews._id,'site'); //true or false;

         //if you want to shorten the scope,use subcategory
        //  let proCat;
        //  if(newNews.categories.length){
        //   proCat = await Category.findOne({_id: newNews.categories[0]}).exec();
        //   proCat =  proCat.processCategory(proCat);
        //   logger.info("proCat category" + JSON.stringify(proCat));
        //  }
    
          res.render(path, {
            seo: {
              title: `${newNews.title}`,
//              keywords: `daily ai news`,
              description: util.trimMetaDescription(newNews.description)
            },
           // isUpvoted,isDownvoted,isBookmarked,
            user: req.user ? req.user.processUser(req.user) : req.user,
            dailyNews: newNews,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
          });


          }else{
            res.redirect('/');
          }
                 // logger.info('site' + JSON.stringify (newNew) );
                   

            

    

                // site.user(site.user_id,theuser=>{
                //     site.comments(post._id, function(comments){
                //       logger.info('into commets function')
                //             res.render(path, {
                //                     user: req.user ? req.user.processUser(req.user) : req.user,
                //                     postUser: req.user ? (req.user._id == post.user_id ? loginedUser : theuser) : theuser,
                //                     site: newNew,
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
  },//(req,res,tertiaryPath,'news/showCurrentNews'); 
  // Save news articles to database
  saveNewsAsync: async function(articles) {
    try {
      const savedArticles = [];
      //add 
      
      for (const article of articles) {
        // 过滤指定域名的内容
        const domainBlacklist = config.dailyNewsDomainBlacklist;
        if (
          (article.source?.name && domainBlacklist.test(article.source.name)) ||
          (article.author && domainBlacklist.test(article.author))
        ) {
          continue;
        }
        //don't store specific数据
        let url = article.url;
        // Check if article already exists by URL
        const existingArticle = await CurrentNews.findOne({ url });
        if (!existingArticle) {
          let summary;

        // Crawl website content and generate AI summary
        try {
          let contentToSummarize;
        //  let contentToSummarize = ; // Remove HTML tags from brief
          
          // If website URL is provided, crawl and add its content
          // if (url) {
          //   try {
          //     const crawlResult = await crawler.getHTML(url);
          //     if (crawlResult.success && crawlResult.html) {
          //       console.log("succeed in crawling website: "+ url);
          //       // Extract text content from HTML and combine with brief
          //       const cheerio = require('cheerio');
          //       const $ = cheerio.load(crawlResult.html);
                
          //       // Remove unwanted elements
          //       $('script, style, iframe, nav, header, footer, .ads, #comments, .social-share').remove();
                
          //       // Try to find main article content using common selectors
          //       let mainContent = $('article, .article, .post-content, .entry-content, .content-area, main,.main').first().text();
                
          //       // Fallback to body content if no article container found
          //       if (!mainContent) {
          //         mainContent = $('body').text();
          //       }
                
          //       // Clean and normalize the text
          //       contentToSummarize = mainContent
          //         .replace(/\s+/g, ' ')
          //         .replace(/\n+/g, '\n')
          //         .trim();
                  
          //       console.log("contentToSummarize length: ", contentToSummarize.length);
          //     //ai summary
          //       const summarizer = new TextSummarizer('deepseek', { apiKey: process.env.DEEPSEEK_API_KEY });
          //       summary = await summarizer.summarize(contentToSummarize);
          //       console.log("summary: "+ summary);

          //     }
          //   } catch (crawlError) {
          //     logger.warn('Failed to crawl website:', crawlError);
          //     // Continue with existing content if crawling fails
          //   }

          // }


        } catch (error) {
          logger.warn('Failed to generate AI summary:', error);
          // Continue with saving even if summarization fails
        }



          const newsArticle = new CurrentNews({
            source: {
              id: article.source.id,
              name: article.source.name
            },
            author: article.author,
            title: article.title,
            title_changed: util.slugify(article.title),
            description: article.description,
            url: article.url,
            image: article.urlToImage,
            publishedAt: new Date(article.publishedAt),
            content: article.content,
            aiSummary: summary,
            hidden: false,
            pv: 0
          });
          const savedArticle = await newsArticle.save();
          savedArticles.push(savedArticle);
        }
      }
      
      return {
        articles: savedArticles,
        count: savedArticles.length,
        error: null
      };
    } catch (err) {
      logger.error(`Error saving news articles: ${err}`);
      return {
        articles: [],
        count: 0,
        error: err
      };
    }
  },

  // Get paginated news articles
  getTenAsync: async function(query, sort, page, limit = 20) {
    let isLastPage;
    const topicCount = config.currentNews_count;
    if(topicCount){limit = topicCount}
    try {
      const itemsPerPage = limit;
      const count = await CurrentNews.countDocuments(query).exec();

      let articles = await CurrentNews.find(query)
        .skip((page - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .sort(sort)
        .exec();

      articles = await this.modifySitesAsync(articles); // Modify the article

      isLastPage = ((page - 1) * topicCount + articles.length) >= count;

      return {
        articles,
        count,
        isLastPage,
        error: null
      };
    } catch (err) {
      logger.error(`Error fetching news articles: ${err}`);
      return {
        articles: [],
        count: 0,
        isLastPage: true,
        error: err
      };
    }
  }
};