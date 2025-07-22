"use strict";
const  User = require('../models/User'),
      logger = require('../libs/logger'),
      TopNews = require('../models/TopNews'),
     // news = require('..//news'),
     topProxy = require('../db_proxy/topNews'),
     
      utils = require('../libs/utility');

const seo = require('../config/seo');
const { normalizeNodeOptions } = require('ioredis/built/cluster/util');
// const Category = require('../models/Category');
module.exports = {
   showOne: async (req,res) => {
    let user = req.user;
    let isAdmin = false;
    if(user){
        user = user.processUser(user);
        isAdmin = user.admin;
    }
    let tertiaryPath = req.params.tertiaryPath;  
     topProxy.getTopByTitle(req,res,tertiaryPath,'news/showOne'); 
   },
   news: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            //user = user.processUser(user);
            isAdmin = user.admin;
        }
        let p = req.query.p;
        const page = p ? parseInt(p) : 1;

        // let atopNews = await TopNews.find({hidden: false, created_at: -1}).exec();
        // atopNews = topProxy.modifySitesAsync(atopNews);
        // logger.info(`topNews: ${JSON.stringify(atopNews)}`);
        let query = {hidden: false};
        let sort = {created_at: -1};//时间顺序排，并还可以提供getTen数据唯一性
       let {tops, count, isLastPage, error} = await topProxy.getTenAsync(query,sort,page);
       let latestNews = await TopNews.find().sort({ created_at: -1 }).limit(1).exec();
        latestNews = await topProxy.modifySitesAsync(latestNews);
        
        res.render('home/newsList', {
            layout: 'new',
            topNews:tops,
            latestNews,
            page: page,
            isLastPage,
            // isFirstPage: (page - 1) == 0,
            //isLastPage: ((page - 1) * 10 + tops.length) == count,
            seo: {
                title: seo.news.title,
                keywords: seo.news.keywords,
                description: seo.news.description,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
  
          // csrfToken: req.csrfToken(),
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
   }


}

