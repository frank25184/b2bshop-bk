"use strict";
let moment = require('moment'),
     Product = require('../models/Product'),
     Category = require('../models/ProductCategory'),
     Subcategory = require('../models/ProductSubcategory'),
     NewsletterMail = require('../models/Email'),
    User = require('../models/User'),
    // Comment = require('../models/ ProductComment'),
    Tag = require('../models/ProductTag'),
    productProxy = require('../db_proxy/product'),
    tagProxy = require('../db_proxy/productTag'),
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
    showProducts: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
        let p = req.query.p;
        const page = p ? parseInt(p) : 1;
  
        let query = {hidden: false};
        let sort = {created_at: -1, upvoteCount:-1};//时间顺序排，并还可以提供getTen数据唯一性
  
        let topProName = req.params.name; 
  
      //   let homeProducts = await Product.find({hidden:false, category: '665db21d916535bf4f0bfc8f'}).sort({ upvoteCount: -1, created_at: -1 }).limit(15).exec();
      //   homeProducts = await productProxy.modifySitesAsync(homeProducts);
        
      //   let entertainProducts =  await Product.find({hidden:false, category:'665d806b7d28e2b564f8d168'}).sort({ upvoteCount: -1, created_at: -1 }).limit(15).exec();
      //   entertainProducts = await productProxy.modifySitesAsync(entertainProducts);
   
      //  let otherProducts =  await Product.find({hidden:false, category: { $in: ['665b2fbde46f8e9f694b595c', '66696f6191564bf1480347e8','66725f58b73a8b6dfaec6960','667ba9408b30bb24a09412c3'] }}).sort({ upvoteCount: -1, created_at: -1 }).limit(15).exec();
      //  otherProducts = await productProxy.modifySitesAsync(otherProducts);
  
      let topCat = {};
      topCat.topProName = topProName; 
  
        if(topProName == 'all'){
              //set query, sort
          topCat.name = 'smart devices';
          topCat.intro = "Discover the coolest and top rated AI-powered smart devices, including AI hardware and innovative gadgets, such as alexa devices, smart home automation hubs, smart switches, smart doorbells, smart glasses, smart plug, smart thermostat, smart speakers, smart clocks, smart display, smart locks, smart lights, smart cameras, smart doors, smart sensors, and smart lightbulbs etc. Below is the most upvoted.";
  
          let {products, count, isLastPage, error} = await productProxy.getTenAsync(query,sort,page);
          //logger.info(`products: ${JSON.stringify(products)}`);
          if(p){
              let data = {products, count, isLastPage, error};
              // 调用 getTenAsync 函数获取文章数据
              res.json(data); // 将数据以 JSON 格式发送回客户端
          }else{
              res.render('home/proCategory', {
                  products,topCat,
                  seo: {
                      title: `Best AI-powered Smart Devices 2025 | CogList`,
                      keywords: `smart devices, ai devices, ai gadgets`,
                      description:`Discover top AI-powered smart devices 2025!`,
                  },
                  env:{
                      cspNonce: res.locals.cspNonce
                  },
                  page: page,
                  isFirstPage: (page - 1) == 0,
                  isLastPage: ((page - 1) * 10 + products.length) == count,
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
  
        }else if(topProName== 'smart-home-devices'){
              //set query, sort
              query.category = '665db21d916535bf4f0bfc8f';//for home
              let {products, count, isLastPage, error} = await productProxy.getTenAsync(query,sort,page);
              logger.info(`products: ${JSON.stringify(products)}`);
  
              topCat.name = 'smart home devices';
              topCat.intro = "Explore the future with 2025's Best AI-Powered Smart Home Devices. Discover latest AI gadgets that offer voice control, energy savings, and intelligent automation etc.";
  
              if(p){
                  let data = {products, count, isLastPage, error};
                  // 调用 getTenAsync 函数获取文章数据
                  res.json(data); // 将数据以 JSON 格式发送回客户端
              }else{
                  res.render('home/proCategory', {
                      products,topCat,
                      seo: {
                          title: `Best AI-powered Smart Home Devices 2025 | CogList`,
                          keywords: `smart home devices, ai home devices, ai home gadgets`,
                          description:`Explore the future with 2025's Best AI-Powered Smart Home Devices. Discover latest AI gadgets that offer voice control, energy savings, and intelligent automation etc.`,
                      },
                      env:{
                          cspNonce: res.locals.cspNonce
                      },
                      page: page,
                      isFirstPage: (page - 1) == 0,
                      isLastPage: ((page - 1) * 10 + products.length) == count,
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
        }else if(topProName== 'entertainment-pets-devices'){
          //set query, sort
          query.category = '665d806b7d28e2b564f8d168';//for home
          let {products, count, isLastPage, error} = await productProxy.getTenAsync(query,sort,page);
          logger.info(`products: ${JSON.stringify(products)}`);
  
          topCat.name = 'devices for entertainment and pets';
          topCat.intro = "Discover the future of home entertainment and pet care with our top picks for the Best AI-Powered Smart Devices (from voice-activated entertainment devices to intelligent devices for pets).";
  
          if(p){
              let data = {products, count, isLastPage, error};
              // 调用 getTenAsync 函数获取文章数据
              res.json(data); // 将数据以 JSON 格式发送回客户端
          }else{
              res.render('home/proCategory', {
                  products,topCat,
                  seo: {
                      title: `Best AI-powered Devices for Entertainment and pets 2025 | CogList`,
                      keywords: `smart entertainment and pets devices, ai entertainment and pets devices, ai entertainment and pets gadgets`,
                      description:`Discover the future of home entertainment and pet care with our top picks for the Best AI-Powered Smart Devices (from voice-activated entertainment devices to intelligent devices for pets).`,
                  },
                  env:{
                      cspNonce: res.locals.cspNonce
                  },
                  page: page,
                  isFirstPage: (page - 1) == 0,
                  isLastPage: ((page - 1) * 10 + products.length) == count,
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
      
    },

    makeProduct: async (req,res) => {
         let tags = await Tag.find({},{name:1}).exec();
         console.log(`tags: ${JSON.stringify(tags)}`)

         res.render('form/gadget', {
              seo: {
                  title: `Sumbit an AI gadget`,
                  keywords: `submit an AI gadget`,
                  description: `Submit an AI gadget and make the product public to the world! `,
              },
              env:{
                  cspNonce: res.locals.cspNonce
              },
               tags,
               user: req.user.processUser(req.user),
               messages: {
                     error: req.flash('error'),
                     success: req.flash('success'),
                     info: req.flash('info'),
               }            

         });
    },
    //single image product submitting
    postProduct: async (req,res)=>{
      const user = req.user,
      product = new Product();

      // Productimage
      let uploadDir = config.uploadDir + 'products/thumbnail/'
      util.checkDir(uploadDir);
      const form =  new IncomingForm({
          multiples: false,
          maxFileSize: 5242880,  /**5 * 1024 * 1024 (5mb)**/
          keepExtensions: true,
          uploadDir: uploadDir,
          allowEmptyFiles: false,
          minFileSize: 1,/* 1 byte*/
          filename: function(name, ext, part, form){
              //name = new Date().toDateString + filename
              const timestamp = new Date().getTime();  
              const seconds = Math.floor(timestamp / 1000);
              return `${seconds}-${name}${ext}`;              
          },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
      });

      form.parse(req,(err,fields,file)=>{
          //let filename = fields.imgName;
          console.log(`file: ${JSON.stringify(file)}`)
           //topIMG name category subcategory tags startingPrice priceCurrent youtube websiteUrl buyingUrl intro content
          let filename = file.topIMG.newFilename.trim();
          product.author = user._id;

          // let mimetype = file.topIMG.mimetype;
          // let regex = /[^\/]+$/;
          // let match = mimetype.match(regex);
          // let extension = match ? match[0] : ''; 
          // filename = filename +'.'+ extension.trim();//加上文件类型如png,jpg...

          product.name = util.trim(xss(fields.name));
          product.name_changed =  util.urlBeautify(xss(fields.name));
          product.user_id = user._id;
         // product.category = xss(fields.category);
          product.tagsString = xss(util.commaSeparatedStringWithNoEmptyValue(fields.tags));

          //product.url = xss(fields.url);
         // product.newFeatures = xss(fields.newFeatures) ? xss(fields.newFeatures).split(';') : [];
         // product.pricing = xss(fields.pricing).split(';');
          product.active_since = xss(fields.active_since);
          product.startingPrice = xss(fields.startingPrice);
          product.priceCurrent = xss(fields.priceCurrent);
          product.youtube = xss(fields.youtube);
          product.websiteUrl = xss(fields.websiteUrl);
          product.buyingUrl = xss(fields.buyingUrl);
         // product.buyingUrl = xss(fields.buyingUrl);
          
          // product.pros = xss(fields.pros) ? util.rmArrBlank(xss(fields.pros).split(';')):[];
          // product.cons = xss(fields.cons) ? util.rmArrBlank(xss(fields.cons).split(';')):[];

          product.brief = xss(fields.brief);
          product.intro = xss(fields.intro);
          
          product.socialLinks = [xss(fields.youtube),xss(fields.twitter),xss(fields.telegram),xss(fields.discord),xss(fields.github)];

          product.img = filename;


          logger.info(`product : ${JSON.stringify(product)}`)
          
           product.save(async (err,product)=>{
                if(err){
                      logger.error(' Productsave error: ' +  err);
                      req.flash('error',`there is some errors when save the post ${err}`);
                      res.redirect('back');
                 }else{
                      let product_id = product._id;
                      let catName = xss(fields.category);
                      let subcatName = xss(fields.subcategory);
                      let cat = {};
                      cat.catName= catName;  cat.subcatName = subcatName;
                      await productProxy.saveCategory(req, res, cat, Category,Product,product_id,'category');
                      await productProxy.saveCategory(req, res, cat, Subcategory,Product,product_id,'subcategory');
                      await tagProxy.saveSingle(product_id, fields.tags, Product, Tag);

                    //  tagProxy.saveSingle(product_id, fields.tags, Product, Tag);
                      // logger.info(`pros: ${JSON.stringify(data.pros)} `);
                      logger.info(`your product data saved successfully: ${product._id}`);
                      req.flash('success','Your product data saved successfully');
                      res.redirect(`/product/` + product.name_changed);


                }
          });

      });

 
    },
    postProductForMultiIMG: async (req,res)=>{
        const user = req.user,
        product = new Product();
  
        // Productimage
        let uploadDir = config.uploadDir + 'products/thumbnail/'
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
            //let filename = fields.imgName;
           // console.log(`files: ${JSON.stringify(files)},fields: ${JSON.stringify(fields)}`)
             //topIMG name category subcategory tags startingPrice priceCurrent youtube websiteUrl buyingUrl intro content
            //let filename = file.topIMG.newFilename.trim();
            logger.info(`files: ${JSON.stringify(files)},fields: ${JSON.stringify(fields)}`)
            product.author = user._id;
            let images = files.topIMG;//array
            let imgs = [];
            for(let i=0;i<images.length;i++){
                let filename = images[i].newFilename.trim();
                imgs.push(filename)
            }
            product.imgs = imgs;

           let name = util.trim(xss(fields.name ? fields.name[0] : '')),
               brand = util.trim(xss(fields.brand ? fields.brand[0] : '')),
               tags = util.trim(xss(fields.tags ? fields.tags[0] : '')),
               availability = util.trim(xss(fields.availability ? fields.availability[0] : '')),
               startingPrice = util.trim(xss(fields.startingPrice ? fields.startingPrice[0] : '')),
               priceCurrent = xss(fields.priceCurrent ? fields.priceCurrent[0] : ''),
               youtube = util.trim(xss(fields.youtube ? fields.youtube[0] : '')),
               twitter = util.trim(xss(fields.twitter ? fields.twitter[0] : '')),
               telegram = util.trim(xss(fields.telegram ? fields.telegram[0] : '')),
               discord = util.trim(xss(fields.discord ? fields.discord[0] : '')),
               github = util.trim(xss(fields.github ? fields.github[0] : '')),
               websiteUrl = util.trim(xss(fields.websiteUrl ? fields.websiteUrl[0] : '')),
               buyingUrl = util.trim(xss(fields.buyingUrl ? fields.buyingUrl[0] : '')),
               brief = util.trim(xss(fields.brief ? util.removeBlankFromText(fields.brief[0]) : '')),
               intro = util.trim(xss(fields.intro ? fields.intro[0] : '')),
               category =   util.trim(xss(fields.category ? fields.category[0] : '')),
               subcategory = util.trim(xss(fields.subcategory ? fields.subcategory[0] : '')),
               sendMailValue = util.trim(xss(fields.sendMail ? fields.sendMail[0] : ''));
               
  
            tags = tags.toLowerCase();
            logger.info(`tags: ${tags}`)
            product.name = name;
            product.brand = brand;
            product.name_changed = util.urlBeautify(name);
            product.user_id = user._id;
           // product.category = xss(fields.category);
            product.tagsString = xss(util.commaSeparatedStringWithNoEmptyValue(tags));
            product.availability = availability;
  
            //product.url = xss(fields.url[0]);
           // product.newFeatures = xss(fields.newFeatures) ? xss(fields.newFeatures).split(';') : [];
           // product.pricing = xss(fields.pricing).split(';');
           // product.active_since = xss(fields.active_since[0]);
            product.startingPrice = startingPrice;
            product.priceCurrent = priceCurrent;
            product.youtube=youtube;
            product.websiteUrl = websiteUrl;
            product.buyingUrl = buyingUrl;
            
            // product.pros = xss(fields.pros) ? util.rmArrBlank(xss(fields.pros).split(';')):[];
            // product.cons = xss(fields.cons) ? util.rmArrBlank(xss(fields.cons).split(';')):[];
  
            product.brief = brief;
            product.intro = intro;
            
            product.socialLinks = [youtube,twitter,telegram,discord,github];
            product.sendMail = sendMailValue === 'true';
  
            logger.info(`product : ${JSON.stringify(product)}`)
            
             product.save(async (err,product)=>{
                  if(err){
                        logger.error(' Productsave error: ' +  err);
                        req.flash('error',`there is some errors when save the post ${err}`);
                        res.redirect('back');
                   }else{
                        logger.info(`product.imgs: ${JSON.stringify(product.imgs)}`)
                        let product_id = product._id;
                        let cat = {};
                        cat.catName= category;  cat.subcatName = subcategory;
                        await productProxy.saveCategory(req, res, cat, Category,Product,product_id,'category');
                        await productProxy.saveCategory(req, res, cat, Subcategory,Product,product_id,'subcategory');
                        await tagProxy.saveSingle(product_id, tags, Product, Tag);

                        if(product.sendMail){
                            let newsletterMails = await NewsletterMail.find().exec();
                            const emailArray = newsletterMails.map(item => item.email);
                            logger.info(`emailArray: ${JSON.stringify(emailArray)}`);
                            //send mail
                            res.render('email/newsletter',
                                {layout:null, user,product}, (err,html)=>{
                                    if(err){logger.info('err in email template', err);}
                                    try{
                                       //(mailList, subj, body)
                                        mailService.sendToGroup(emailArray, "Latest AI Device Today", html);
                                        logger.info(`send to group done`);
                                       // mailService.send(user.email,'Thanks for your signup!',html);
                                    }catch(ex){
                                        mailService.mailError('The email widget broke down!', __filename,ex);
                                    }
                                }
                           );
                        }
                       
                      //  tagProxy.saveSingle(product_id, fields.tags, Product, Tag);
                        // logger.info(`pros: ${JSON.stringify(data.pros)} `);
                        logger.info(`your product data saved successfully: ${product._id}`);
                        req.flash('success','Your product data saved successfully');
                        res.redirect(`/product/` + product.name_changed);
  
  
                  }
            });
  
        });
  
   
      },

    showProduct: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
        let name = req.params.name;  
        
        console.log(`req.getIpInfo: ${JSON.stringify(req.ipInfo)}`);
        // {"ip":"157.90.182.28","range":[2639921152,2639986687],"country":"US","region":"","eu":"0","timezone":"America/Chicago","city":"","ll":[37.751,-97.822],"metro":0,"area":1000}
        console.log('name is '+name); 
        let ip = req.ipInfo.ip;
       // logger.info(`ip: ${ip}`);
        productProxy.getProductByName(req,res,name,'product/showOne'); 
    },
    category: async (req, res)=>{//subcategory
      let user = req.user;
      let isAdmin = false;
      if(user){
          user = user.processUser(user);
          isAdmin = user.admin;
      }
      let p = req.query.p;
      const page = p ? parseInt(p) : 1;

      let cat = req.params.category;
      cat = util.unslugify(cat);
      logger.info('cat is '+ cat);   
      
      let theCat  = await Subcategory.findOne({name: cat}).exec();
      //if name doesn't exist in the db
      if(!theCat){
       req.flash('error','Name not existing or is null/undefined');
       return  res.redirect('back'); 
      }
      theCat = theCat.processCategory(theCat);
      let id = theCat._id;
      let name = theCat.name;

      let query = {subcategory: id, hidden: false};
      let sort = {created_at: -1};//时间顺序排，并还可以提供getTen数据唯一性

    //   let products = await Product.find({subcategory: id, hidden: false}).exec();
    //   products = await productProxy.modifySitesAsync(products);
     let {products, count, isLastPage, error} = await productProxy.getTenAsync(query,sort,page);

    if(p){
            let data = {products, count, isLastPage, error};
            // 调用 getTenAsync 函数获取文章数据
            res.json(data); // 将数据以 JSON 格式发送回客户端
    }else{
        res.render('home/proCategory', {
            theCat,
            products,
            seo: {
                title: `AI Device List in CogList`,
                keywords: `${name},AI device list in ${name}`,
                description: theCat.intro ? util.truncateString(theCat.intro, 160,'...'): `AI smart devices in ${name} 2025!`,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            page: page,
            isFirstPage: (page - 1) == 0,
            isLastPage: ((page - 1) * 10 + products.length) == count,
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







    //   console.log('products in category:' +  JSON.stringify(products))

    //   res.render('home/proCategory', {
    //       theCat,
    //       products,
    //       seo: {
    //           title: `Best AI Devices in ${name} 2025 | CogList`,
    //           keywords: `${name},best AI gadgets in ${name}`,
    //           description: theCat.intro ? util.truncateString(theCat.intro, 160,'...'): `Discover top smart products in ${name} 2025!`,
    //       },
    //       env:{
    //           cspNonce: res.locals.cspNonce
    //       },
    //       page: page,
    //       isFirstPage: (page - 1) == 0,
    //       isLastPage: ((page - 1) * 10 + products.length) == count,
    //       user: req.user ? req.user.processUser(req.user) : req.user,
    //       isAdmin: isAdmin,

    //     // csrfToken: req.csrfToken(),
    //       messages: {
    //           error: req.flash('error'),
    //           success: req.flash('success'),
    //           info: req.flash('info'),
    //       }, // get the user out of session and pass to template
    //   }); //render 



    },
   showTag: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
  
       let tag = req.params.tag;
       console.log('tag is '+ tag);   
       
       let theTag  = await Tag.findOne({name: tag}).populate('posts').exec();
       console.log(`theTag: ${JSON.stringify(theTag)}`);
      // tags.map(function(v){
      //   return v.posts = productProxy.modifySitesAsync(v.posts)
      // })
      if(theTag){
        theTag = theTag.processTag(theTag) ;
        let tagName =  util.formatStr(theTag.name);
  
        theTag.intro  = theTag.intro ? theTag.intro  : `${tagName} AI Tools for Your Everyday Needs!`;
        
          theTag.posts.map(function(v){
            return v.tagsArray = util.stringToArray(v.tagsString)
           // return v.tagsArray = v.tagsString.split(',');
          })
          //console.log(`theTag.post: ${JSON.stringify(theTag.posts)}`)  
  
          res.render('home/tag', {
              theTag,
              seo: {
                  title: `Best ${tagName} Projects 2023 | CogList`,
                  keywords: `${tagName},best ${tagName},top ${tagName}`,
                  description: `${theTag.intro ? util.truncateString(theTag.intro,170,'...'): `Discover top premium or free ${tagName} projects in CogList!`}`,
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
      }else{
        req.flash("error","Your tag requested doesn't exist!");
        res.redirect('back');
      }
  },
  

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



    showPost: (req,res)=>{
        const title = req.params.name;
        console.log('name is '+name);
        productProxy.getSiteByName(req,res,title,'site/showOne');      
    },
  

  
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