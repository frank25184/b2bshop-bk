"use strict";
let moment = require('moment'),
     Prompt = require('../models/Prompt'),
     Category = require('../models/PromptCategory'),
     SubCategory = require('../models/PromptSubcategory'),
    User = require('../models/User'),
    // Comment = require('../models/ ProductComment'),
    promptProxy = require('../db_proxy/prompt'),
    env = process.env.NODE_ENV || 'development',
    { IncomingForm }  = require('formidable'),
    config  = require('../common/get-config'),
    mailService  = require('../libs/mail')(config),
    logger = require('../libs/logger');
const Mail = require('nodemailer/lib/mailer');
    let seo = require('../config/seo');
    let util = require('../libs/utility');
    let mongoose = require('mongoose');
    let xss = require('xss');


module.exports = {

    makePrompt: async (req,res) => {
         res.render('form/prompt', {
              seo: {
                  title: `Sumbit an AI Prompt`,
                  keywords: `submit AI Prompt`,
                  description: `Submit an AI Prompt and make your prompt public to the world! `,
              },
              env:{
                  cspNonce: res.locals.cspNonce
              },
               user: req.user.processUser(req.user),
               messages: {
                     error: req.flash('error'),
                     success: req.flash('success'),
                     info: req.flash('info'),
               }            

         });
    },
    postSiteForMultiIMG: async (req,res)=>{
        const user = req.user,
        product = new Prompt();
  
        // Productimage
        let uploadDir = config.uploadDir + 'prompts/thumbnail/'; 
        util.checkDir(uploadDir);
        const form =  new IncomingForm({
            multiples: true,
            maxFileSize: 5242880*2,  /**5 * 1024 * 1024 (5mb)**/
            keepExtensions: true,
            uploadDir: uploadDir,
            allowEmptyFiles: false,
            minFileSize: 1,/* 1 byte*/
            filename: function(name, ext, part, form){
                //name = new Date().toDateString + filename
                const timestamp = new Date().getTime();  
                const seconds = Math.floor(timestamp / 1000);
                name = util.urlBeautify(name)
                return `${seconds}-${name}${ext}`;              
            },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
        });
  
        form.parse(req,(err,fields,files)=>{
            logger.info(`files: ${JSON.stringify(files)},fields: ${JSON.stringify(fields)}`)
            product.author = user._id;
            let images = files.topIMG;//array
            let imgs = [];
            for(let i=0;i<images.length;i++){
                let filename = images[i].newFilename.trim();
                imgs.push(filename)
            }
            product.imgs = imgs;

           let title = util.trim(xss(fields.title ? fields.title[0] : '')),
            intro = util.trim(xss(fields.intro ? fields.intro[0] : '')),
            model = util.trim(xss(fields.model ? fields.model[0] : '')),
            prompt = util.trim(xss(fields.prompt ? fields.prompt[0] : '')),
            seoTitle = util.trim(xss(fields.seoTitle ? fields.seoTitle[0] : '')),
            seoKeyword = util.trim(xss(fields.seoKeyword ? fields.seoKeyword[0] : '')),
            seoDescription = util.trim(xss(fields.seoDescription ? fields.seoDescription[0] : '')),
            categories =  (fields["category[]"] || []).map(cate => util.trim(xss(cate))).filter(cate => cate.length > 0),
            subcategories =  (fields["subcategory[]"] || []).map(subca => util.trim(xss(subca))).filter(subca => subca.length > 0);

            // Ensure both arrays have the same length
            if (categories.length !== subcategories.length) {
                // Handle the error case where the lengths do not match
                req.flash('error', 'The number of categories must match the number of subcategories.');
                logger.error("The number of categories must match the number of subcategories.");
                return res.redirect('back');
            }

            product.user_id = user._id;
            product.title = title;
            product.title_changed = util.urlBeautify(title);
            product.model = model;
            product.prompt = prompt;
            product.intro = intro;
            product.seoKeyword = seoKeyword;
            product.seoTitle = seoTitle;
            product.seoDescription = seoDescription;
            let tertiaryPath = fields.tertiaryPath;
            if (tertiaryPath && tertiaryPath.length) { 
                tertiaryPath = util.trim(xss(fields.tertiaryPath[0]));
                tertiaryPath = util.urlBeautify(tertiaryPath);
                product.tertiaryPath = tertiaryPath; 
            }
            product.save(async (err,product)=>{
                  if(err){
                        logger.error(' Productsave error: ' +  err);
                        req.flash('error',`there is some errors when save the post ${err}`);
                        res.redirect('back');
                   }else{
                        logger.info(`product.imgs: ${JSON.stringify(product.imgs)}`)
                        let product_id = product._id;

                        for (let i = 0; i < categories.length; i++) {
                            const cat = {
                                catName: categories[i],
                                subcatName: subcategories[i] // Assuming subcategories are in the same order
                            };
                            await promptProxy.saveCategory(req, res, cat, Category, Prompt, product_id, 'category');
                            await promptProxy.saveCategory(req, res, cat, SubCategory,Prompt,product_id,'subcategory');
                        }
                        logger.info(`your website data saved successfully: ${product._id}`);
                        req.flash('success','Your website data saved successfully');
                        res.redirect(`/prompt/` + product.tertiaryPath);
                  }
            });
  
        });
  
   
      },

    showSite: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
        let tertiaryPath = req.params.tertiaryPath;  
        
        console.log(`req.getIpInfo: ${JSON.stringify(req.ipInfo)}`);
        // {"ip":"157.90.182.28","range":[2639921152,2639986687],"country":"US","region":"","eu":"0","timezone":"America/Chicago","city":"","ll":[37.751,-97.822],"metro":0,"area":1000}
        console.log('tertiaryPath is '+ tertiaryPath); 
        let ip = req.ipInfo.ip;
       // logger.info(`ip: ${ip}`);
        promptProxy.getSiteByName(req,res,tertiaryPath,'prompt/showOne'); 
    },
//     category: async (req, res)=>{//subcategory
//       let user = req.user;
//       let isAdmin = false;
//       if(user){
//           user = user.processUser(user);
//           isAdmin = user.admin;
//       }
//       let p = req.query.p;
//       const page = p ? parseInt(p) : 1;

//       let cat = req.params.category;
//       cat = util.unslugify(cat);
//       logger.info('cat is '+ cat);   
      
//       let theCat  = await Subcategory.findOne({name: cat}).exec();
//       //if name doesn't exist in the db
//       if(!theCat){
//        req.flash('error','Name not existing or is null/undefined');
//        return  res.redirect('back'); 
//       }
//       theCat = theCat.processCategory(theCat);
//       let id = theCat._id;
//       let name = theCat.name;

//       let query = {subcategory: id, hidden: false};
//       let sort = {created_at: -1};//时间顺序排，并还可以提供getTen数据唯一性

//     //   let products = await Product.find({subcategory: id, hidden: false}).exec();
//     //   products = await productProxy.modifySitesAsync(products);
//      let {products, count, isLastPage, error} = await productProxy.getTenAsync(query,sort,page);

//     if(p){
//             let data = {products, count, isLastPage, error};
//             // 调用 getTenAsync 函数获取文章数据
//             res.json(data); // 将数据以 JSON 格式发送回客户端
//     }else{
//         res.render('home/proCategory', {
//             theCat,
//             products,
//             seo: {
//                 title: `Best AI Devices in ${name} 2025 | CogList`,
//                 keywords: `${name},best AI devices in ${name}`,
//                 description: theCat.intro ? util.truncateString(theCat.intro, 160,'...'): `Discover top smart products in ${name} 2025!`,
//             },
//             env:{
//                 cspNonce: res.locals.cspNonce
//             },
//             page: page,
//             isFirstPage: (page - 1) == 0,
//             isLastPage: ((page - 1) * 10 + products.length) == count,
//             user: req.user ? req.user.processUser(req.user) : req.user,
//             isAdmin: isAdmin,
    
//             // csrfToken: req.csrfToken(),
//             messages: {
//                 error: req.flash('error'),
//                 success: req.flash('success'),
//                 info: req.flash('info'),
//             }, // get the user out of session and pass to template
//          }); //render 
//     }







//     //   console.log('products in category:' +  JSON.stringify(products))

//     //   res.render('home/proCategory', {
//     //       theCat,
//     //       products,
//     //       seo: {
//     //           title: `Best AI Devices in ${name} 2025 | CogList`,
//     //           keywords: `${name},best AI gadgets in ${name}`,
//     //           description: theCat.intro ? util.truncateString(theCat.intro, 160,'...'): `Discover top smart products in ${name} 2025!`,
//     //       },
//     //       env:{
//     //           cspNonce: res.locals.cspNonce
//     //       },
//     //       page: page,
//     //       isFirstPage: (page - 1) == 0,
//     //       isLastPage: ((page - 1) * 10 + products.length) == count,
//     //       user: req.user ? req.user.processUser(req.user) : req.user,
//     //       isAdmin: isAdmin,

//     //     // csrfToken: req.csrfToken(),
//     //       messages: {
//     //           error: req.flash('error'),
//     //           success: req.flash('success'),
//     //           info: req.flash('info'),
//     //       }, // get the user out of session and pass to template
//     //   }); //render 



//     },
//    showTag: async (req,res) => {
//         let user = req.user;
//         let isAdmin = false;
//         if(user){
//             user = user.processUser(user);
//             isAdmin = user.admin;
//         }
  
//        let tag = req.params.tag;
//        console.log('tag is '+ tag);   
       
//        let theTag  = await Tag.findOne({name: tag}).populate('posts').exec();
//        console.log(`theTag: ${JSON.stringify(theTag)}`);
//       // tags.map(function(v){
//       //   return v.posts = productProxy.modifySitesAsync(v.posts)
//       // })
//       if(theTag){
//         theTag = theTag.processTag(theTag) ;
//         let tagName =  util.formatStr(theTag.name);
  
//         theTag.intro  = theTag.intro ? theTag.intro  : `${tagName} AI Tools for Your Everyday Needs!`;
        
//           theTag.posts.map(function(v){
//             return v.tagsArray = util.stringToArray(v.tagsString)
//            // return v.tagsArray = v.tagsString.split(',');
//           })
//           //console.log(`theTag.post: ${JSON.stringify(theTag.posts)}`)  
  
//           res.render('home/tag', {
//               theTag,
//               seo: {
//                   title: `Best ${tagName} Projects 2023 | CogList`,
//                   keywords: `${tagName},best ${tagName},top ${tagName}`,
//                   description: `${theTag.intro ? util.truncateString(theTag.intro,170,'...'): `Discover top premium or free ${tagName} projects in CogList!`}`,
//               },
//               env:{
//                   cspNonce: res.locals.cspNonce
//               },
              
    
//               user: req.user ? req.user.processUser(req.user) : req.user,
//               isAdmin: isAdmin,
    
//             // csrfToken: req.csrfToken(),
//               messages: {
//                   error: req.flash('error'),
//                   success: req.flash('success'),
//                   info: req.flash('info'),
//               }, // get the user out of session and pass to template
//           }); //render 
//       }else{
//         req.flash("error","Your tag requested doesn't exist!");
//         res.redirect('back');
//       }
//   },
  

  //   submitSite: async (req,res)=>{

  //       const user = req.user;
  //       let site;
  //           //   name = req.body.name,
  //           //   url = req.body.url,
  //           //  // tags = req.body.tags,
  //           //   category = req.body.category,
  //           //   brief = req.body.brief,

  //           // body = req.body,

           

  //           let uploadDir = config.uploadDir + 'site/';
  //           utils.checkDir(config.uploadDir);
  //           utils.checkDir(uploadDir);
  //           const form =  new IncomingForm({
  //               multiples: false,
  //               maxFileSize: 5242880,  /**5 * 1024 * 1024 (5mb)**/
  //               keepExtensions: false,
  //               uploadDir: uploadDir,
  //               allowEmptyFiles: false,
  //               minFileSize: 1,/* 1 byte*/
  //               filename: function(name, ext, part, form){
  //                   //name = new Date().toDateString + filename
  //                   return name;
  //               },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
  //           });

  //           form.parse(req,(err,fields,file)=>{
  //               //let filename = fields.imgName;
  //               let category = fields.category;
  //               console.log(`file: ${JSON.stringify(file)}`)

  //               if(category == 'Wallets'){
  //                   site = new Wallet();
  //               }else if(category == 'Exchanges'){
  //                   site = new Product();
  //               }else{
  //                 res.redirect('back');
  //               }

  //               //**common parts**
                 
  //               //let filename = file.img.newFilename;
  //               site.author = user._id;
  //               // site.user_id = user._id;
  //               site.name = fields.name;
  //               if(util.blankExit(fields.name)){
  //                 site.name_changed = fields.name.split(' ').join('-');
  //               }else{
  //                 site.name_changed = fields.name;
  //               }
  //               site.brief = fields.brief;
  //               site.url = fields.url;
  //               site.user_id = user._id;
        
  //               //site.img = filename;
                
  //               site.best_for = fields.best_for;
  //               site.decentralized = fields.decentralized;
  //               site.one = fields.one;
  //               site.tagsString = fields.tagsString;
  //               site.category = fields.category;//for link query ?
  //               site.blockchain = fields.blockchain;

  //               let pros = fields.pros;
  //               let cons =fields.cons;
  //               site.pros = pros.split(';');
  //               site.cons = cons.split(';');
  //               if(fields.kyc == 'yes'){
  //                 site.kyc_required = true;
  //               }else if(fields.kyc == 'no'){
  //                 site.kyc_required = false;
  //               }
  //               site.base = fields.base;
  //               site.active_since = fields.active_since;
  //               if(fields.hacked == 'yes'){
  //                site.hacked = true;
  //               }else if(fields.hacked == 'no'){
  //                site.hacked = false;
  //               }
  //               site.hacked_history = fields.hacked_history;

  //               site.twitter = fields.twitter;
  //               site.telegram = fields.telegram;
  //               site.discord = fields.discord;

  //               if(fields.us_allowed == 'yes'){
  //                 site.us_allowed = true;
  //                }else if(fields.us_allowed == 'no'){
  //                 site.us_allowed = false;
  //                }


  //               /**crypto wallet**/
  //               site.currencies = fields.currencies;
  //               site.currencies_num = fields.currencies_num;
  //               if(fields.code_open_source =='yes'){
  //                 site.code_open_source = true;
  //               }else if(fields.code_open_source =='no'){
  //                 site.code_open_source = false;
  //               }


  //               //site.wallet_type = fields.wallet_type;
  //               site.compatibilities = fields.compatibilities;  
  //               site.transferable = fields.transferable; 
  //               if(fields.swap =='yes'){
  //                 site.swap = true;
  //               }else if(fields.swap =='no'){
  //                 site.swap = false;
  //               }
  //               if(fields.control_private_keys =='yes'){
  //                 site.control_private_keys  = true;
  //               }else if(fields.control_private_keys  =='no'){
  //                 site.control_private_keys  = false;
  //               }


  //               /**crypto exchanges**/
  //               site.price = fields.price;
  //               site.taker_fee = fields.taker_fee;
  //               site.maker_fee = fields.maker_fee;
  //               site.withdrawn_fee = fields.withdrawn_fee;


  //                if(fields.regulated == 'yes'){
  //                 site.regulated = true;
  //                }else if(fields.regulated == 'no'){
  //                 site.regulated = false;
  //                }
  //                site.spot0_taker_fee = fields.spot0_taker_fee;
  //                site.spot0_maker_fee = fields.spot0_maker_fee;
  //                site.future0_taker_fee = fields.spot0_taker_fee;
  //                site.future0_maker_fee = fields.spot0_maker_fee;   

                 
  //                let wire = fields.wire;

  //                site.save((err,site)=>{
  //                     if(err){
  //                           logger.error('site save error: ' +  err);
  //                           req.flash('error',`there is some errors when save the post ${err}`);
  //                           res.redirect('back');
  //                      }else{
  //                           //new tag and save post
                            

  //                           if(site){
  //                               let tagS = fields.tagsString;
  //                               if(category == 'Exchanges'){
  //                                 tagProxy.saveSingle(site._id, tagS, Site, SiteTag);                                    
  //                               }else if(category == 'Wallets')
  //                               tagProxy.saveSingle(site._id, tagS, Wallet, WalletTag);  
  //                             }else{
  //                                 logger.debug('no data')
  //                             }







  //                           // prosArray.forEach((v, i, a) => {
  //                           //     Site.updateOne({
  //                           //         id: site._id
  //                           //       }, {
  //                           //         '$push': {
  //                           //             pros: v,
  //                           //         }
  //                           //       }, function(err, data) {
  //                           //         if (err) {
  //                           //           logger.error(`update pro and con error: ${err}`);
  //                           //           res.redirect('back');
  //                           //         } else {


  //                           //         }
  //                           //       });                    
  //                           // });


  //                           // consArray.forEach((v, i, a) => {
  //                           //     Site.updateOne({
  //                           //         id: site._id
  //                           //       }, {
  //                           //         '$push': {
  //                           //             cons: v,
  //                           //         }
  //                           //       }, function(err, data) {
  //                           //         if (err) {
  //                           //           logger.error(`update pro and con error: ${err}`);
  //                           //           res.redirect('back');
  //                           //         } else {


  //                           //         }
  //                           //       });                    
  //                           // })

              
  //                           logger.info(`your site date saved successfully: ${site._id}`);
  //                           req.flash('success','Your site data saved successfully');
  //                           res.redirect(`/wallet/${site.name_changed}` );


  //                     }
  //               });

  //           });








   
  //  },



    // showPost: (req,res)=>{
    //     const title = req.params.name;
    //     console.log('name is '+name);
    //     productProxy.getSiteByName(req,res,title,'site/showOne');      
    // },
  

  
    //   getPersonalPosts: (req,res)=>{
    //               const user_id = req.params.user_id;                                  
    //               postProxy.getPostsByUserId(req,res,user_id,'post/personalPosts');
    //    },



    //    getAllPosts: async function(req,res){
      
    //             const page = req.query.p ? parseInt(req.query.p) : 1;
    //             //let loginedUser;
    //             console.log('entering into the posts page');
    //             let query = {},sort = {};
               

    //             //查询并返回第 page 页的 10 篇文章
    //             postProxy.getTen(query,sort, page, (err, posts, count)=> {
    //                 if (err) {
    //                 console.log('some error with getting the 10 posts:'+ err);
    //                 //next(err);
    //                 posts = [];
    //                 } 

    //                logger.info('query'+ JSON.stringify(query) + JSON.stringify(posts));
                    
    //                 res.render('post/posts', {
    //                         title: 'All the Articles for Web3',
    //                         user: req.user ? req.user.processUser(req.user) : req.user,
    //                         //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
    //                         posts: posts,
    //                         page: page,
    //                         isFirstPage: (page - 1) == 0,
    //                         isLastPage: ((page - 1) * 10 + posts.length) == count,
    //                         messages: {
    //                             error: req.flash('error'),
    //                             success: req.flash('success'),
    //                             info: req.flash('info'),
    //                         }, // get the user out of session and pass to template
    //                 }); 
    //             });	    




    //    },
 
    //  getTagsPost: (req,res)=>{
    //             const tag_id = req.params.tag_id;
    //             const page = req.query.p ? parseInt(req.query.p) : 1;
    //             //let loginedUser;
    //             console.log('entering into the tagpost');

    //             //查询并返回第 page 页的 10 篇文章
    //             postProxy.getTen(tag_id, page, (err, posts, count)=> {
    //                 if (err) {
    //                 console.log('some error with getting the 10 posts:'+ err);
    //                 //next(err);
    //                 posts = [];
    //                 } 
    //                 // if(req.user){
    //                 //     loginedUser = req.user.processUser(req.user);
    //                 // }
    //                 //userProxy.getUserById(user_id, theuser=>{
    //                 console.log('tag posts for'+ tag_id +posts);
                    
    //                 res.render('post/tagPosts', {
    //                         title: 'specific tag page',
    //                         user: req.user ? req.user.processUser(req.user) : req.user,
    //                         //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
    //                         posts: posts,
    //                         page: page,
    //                         isFirstPage: (page - 1) == 0,
    //                         isLastPage: ((page - 1) * 10 + posts.length) == count,
    //                         messages: {
    //                             error: req.flash('error'),
    //                             success: req.flash('success'),
    //                             info: req.flash('info'),
    //                         }, // get the user out of session and pass to template
    //                 }); 


    //             },'exist_tag_id');	           

    //  },

    //  getSearch: function(req,res){
    //         const page = req.query.p ? parseInt(req.query.p) : 1;
    //         //let loginedUser;
    //         console.log('entering into the serarchPost');           
    //         let keyword;
    //         if(req.query.keyword){
    //             keyword = req.query.keyword;
    //         }
           
    //        pattern = new RegExp(keyword, "i");
    //        console.log('keyword search for'+ keyword);
    //        postProxy.getTen(pattern, page, (err, posts, count)=> {
    //                 if (err) {
    //                     console.log('some error with getting the 10 posts for search page:'+ err);
    //                     posts = [];
    //                 } 
    //                 res.render('post/tagPosts', {
    //                         title: 'specific pages',
    //                         user: req.user ? req.user.processUser(req.user) : req.user,
    //                         //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
    //                         posts: posts,
    //                         keyword: keyword,
    //                         page: page,
    //                         isFirstPage: (page - 1) == 0,
    //                         isLastPage: ((page - 1) * 10 + posts.length) == count,
    //                         messages: {
    //                             error: req.flash('error'),
    //                             success: req.flash('success'),
    //                             info: req.flash('info'),
    //                         }, // get the user out of session and pass to template
    //                 });                 
    //        },undefined,'exits_title',undefined);

    //  },






}