"use strict";
const  User = require('../models/User'),
Product = require('../models/Product'),
productProxy = require('../db_proxy/product'),
      logger = require('../libs/logger'),
      postProxy = require('../db_proxy/post'),
      utils = require('../libs/utility');

const seo = require('../config/seo');
// const Category = require('../models/Category');
module.exports = {
    articles: async (req, res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){user = user.processUser(user);isAdmin = user.admin;}
        let query={hidden:false},sort={created_at:-1};
        let page = req.query.p ? parseInt(req.query.p) : 1; 
        let {posts,count,isLastPage,isFirstPage,error} = await postProxy.getTenAsync(query,sort,page,'populated categories');
 
        res.render('post/posts', {
            articles: posts,
            isLastPage,
            isFirstPage,
            page, // 当前页码
            count, // 总记录数
            seo: {
                title: seo.articles.title,
                keywords: seo.articles.keywords,
                description: seo.articles.description,
            }, 
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },
    terms: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){user = user.processUser(user);isAdmin = user.admin;}
        res.render('support/terms', {
            seo: {
                title: seo.terms.title,
                keywords: seo.terms.keywords,
                description: seo.terms.description,
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin, 
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },
    privacyPolicy: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){user = user.processUser(user);isAdmin = user.admin;}
        res.render('support/privacy-policy', {
            seo: {
                title: seo.privacyPolicy.title,
                keywords: seo.privacyPolicy.keywords,
                description: seo.privacyPolicy.description,
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },
    home: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){user = user.processUser(user);isAdmin = user.admin;}
        let query={hidden:false},sort={created_at:-1}, page=1;
        let {products} = await productProxy.getTenAsync(query,sort,page,'populated categories');
        res.render('home/home', {
            products,
            isHome: true,
            seo: {
                title: seo.home.title,
                keywords: seo.home.keywords,
                description: seo.home.description,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },
    products: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
        let query={hidden:false},sort={created_at:-1}, page=1;
        let {products} = await productProxy.getTenAsync(query,sort,page,'populated categories');
        //logger.info(`products: ${JSON.stringify(products)}`);
      //  products = await productProxy.modifySitesAsync(products);
        res.render('product/products', {
            products,
            seo: {
                title: seo.products.title,
                keywords: seo.products.keywords,
                description: seo.products.description,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },
    pricing: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            //user = user.processUser(user);
            isAdmin = user.admin;
           
        }
        res.render('support/pricing', {
          seo: {
              title: 'Pricing for Sponsors and AI Apps Owners',
              keywords: 'CogList Pricing',
              description: "Boost your AI apps' visibility with our free and paid plans, offering dofollow links, unlimited submissions, priority support, and exclusive features.",
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
      }); //render );
  
        
    },
    privacy: async (req,res) => {
      let user = req.user;
      let isAdmin = false;
      if(user){
          //user = user.processUser(user);
          isAdmin = user.admin;
      }
      res.render('home/privacy', {
        seo: {
            title: 'Privacy Policy',
            keywords: 'CogList Privacy Policy',
            description: 'CogList Privacy Policy',
        },
        env:{
            cspNonce: res.locals.cspNonce
        },
        user: req.user ? req.user.processUser(req.user) : req.user,
        isAdmin: isAdmin,
        messages: {
            error: req.flash('error'),
            success: req.flash('success'),
            info: req.flash('info'),
        }, // get the user out of session and pass to template
    }); //render ); 
    },
    roadmap: async (req,res) => {
      let user = req.user;
      let isAdmin = false;
      if(user){
          //user = user.processUser(user);
          isAdmin = user.admin;
      }
      res.render('home/roadmap', {
        seo: {
            title: 'CogList Roadmap',
            keywords: 'CogList Roadmap',
            description: 'CogList Roadmap for Indie Hackers',
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
    }); //render ); 
    }


}

