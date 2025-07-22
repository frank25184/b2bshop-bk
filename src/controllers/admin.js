"use strict";

const Category = require('../models/PostCategory');

let moment = require('moment'),
    Post = require('../models/Post'),
    Subcategory = require('../models/PostSubcategory'),
   // User = require('../models/User'),
    Comment = require('../models/Comment'),
   //NewsletterMail = require('../models/Email'),
    //Tag = require('../models/ProductTag'),//site Tag model
    ArticleTag = require('../models/PostTag'),
    Email = require('../models/Email'),
    tagProxy = require('../db_proxy/tag'),
    postProxy = require('../db_proxy/post'),
    logger = require('../libs/logger'),
    asyncErrHandle = require('../common/asyncErrHandle'),
    util = require('../libs/utility'),
    xss = require('xss'),
    { IncomingForm }  = require('formidable'),
    env = process.env.NODE_ENV || 'development',
    config = require(`../../config.${env}.js`),
    mailService  = require('../libs/mail')(config),
    cache = require('../libs/cache'),
    crypto = require('crypto');
    // { getPageStats } = require('../controllers/admin/pageStats'); 
   // const { generateReviewWithScreenshot } = require('../ai/generateReviewWithScreenshot');
module.exports = {
//   getReviewUploadAuto : async (req, res) => {
//     let user = req.user;
//     let isAdmin = false;
//     let user_id;
//     if(user){
//       user = user.processUser(user);
//       isAdmin = user.admin;
//       user_id = user._id;
//     }
//     res.render('form/reviewUpload', {
//         seo: {
//             title: `Auto AI Review`,
//             keywords: `Auto AI Review`,
//             description: `Auto AI Review`,
//         },
//         env:{
//             cspNonce: res.locals.cspNonce
//         },
//          user,
//          messages: {
//                error: req.flash('error'),
//                success: req.flash('success'),
//                info: req.flash('info'),
//          }            

//    });
//   },
//   reviewUploadAuto: async (req, res) => {
//     let user = req.user;
//     let isAdmin = false;
//     let user_id;
//     if(user){
//       user = user.processUser(user);
//       isAdmin = user.admin;
//       user_id = user._id;
//     }
//     try {
//         const { productName, productUrl, category, subcategory, stageCategory, stageSubcategory,availability,pricingModel,platform,trialAvailable,priceCurrent,isAIAgent,startingPrice } = req.body;
//         console.log(`req.body: ${JSON.stringify(req.body)}`)
//         // Validate required fields
//         if (!productName || !productUrl) {
//             return res.status(400).json({
//             success: false,
//             error: 'Product name and URL are required'
//             });
//         }
//         let data ={
//             category,
//             subcategory,
//             stageCategory,
//             stageSubcategory,
//             author: req.user?._id,
//             user_id: req.user?._id,
//             availability: availability,
//             pricingModel: pricingModel,
//             platform: platform || 'web',
//             trialAvailable: trialAvailable,
//             priceCurrent: priceCurrent,
//             startingPrice: startingPrice,
//             isAIAgent: isAIAgent
//         }
//         console.log(`data/options: ${JSON.stringify(data)}`)
//         // Generate review with screenshot
//         const reviewData = await generateReviewWithScreenshot(productName, productUrl, data);
//         // Return success response with redirect URL
//         res.json({
//             success: true,
//             redirectUrl: `/review/${reviewData.name_changed}`
//         });
//     } catch (error) {
//         console.error('Error generating AI review:', error);
//         res.status(500).json({
//             success: false,
//             error: error.message || 'Failed to generate AI review'
//         });
//     }
//   },
  getUnsubscribe: async (req, res) => {
      let user = req.user;
      let isAdmin = false;
      let user_id;
      if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            user_id = user._id;
      }
      res.render('form/getUnsubscribe', {
            seo: {
                title: `Unsubscribe your email`,
                keywords: `Unsubscribe your email`,
                description: `Unsubscribe your email! `,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
             user,
             messages: {
                   error: req.flash('error'),
                   success: req.flash('success'),
                   info: req.flash('info'),
             }            

       });
  },
  postUnsubscribe:  async (req, res) => {
            let user = req.user;
            let isAdmin = false;
            let user_id;
            if(user){
                  user = user.processUser(user);
                  isAdmin = user.admin;
                  user_id = user._id;
            }
            console.log('into admin/postUnsubscribe');
            let {email} = req.body;
      
            let data;
            if (!email) {
            console.log('no email')
            data = {choices:[{"message": {content: 'Missing required parameter: Email.'}}], status: 400};
            return res.status(200).json(data);
            }
      
            try {
            let emailExist = await  Email.findOne({email}).exec();
            if(emailExist && emailExist.email){
            console.log('email exist..')}
            await Email.findOneAndUpdate({ _id: emailExist._id }, {unsubscribe: true}).exec();
            data = {choices:[{"message": {content: `${email} has unsubscribed. You'll not receive our weekly news from now on!`}}], status: 400};
            return res.status(200).json(data);
      
            } catch (error) {
            data = {choices:[{"message": {content: `Something went wrong. Please try again later!`}}], status: 400};
            console.log(`data: ${JSON.stringify(data)}, error: ${JSON.stringify(error)} `);
            return res.status(200).json(data);
            }
      
      
  },
  postSubscribe: async (req, res) => {
      let user = req.user;
      let isAdmin = false;
      let user_id;
      if(user){
      user = user.processUser(user);
      isAdmin = user.admin;
      user_id = user._id;
      }
      console.log('into admin/subscribe')

      let {email,frequency} = req.body;
      let from = req.query.from;
    // Validate email
    if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return res.status(200).json({
            choices: [{
                message: { content: 'Invalid email format.' }
            }],
            status: 400
        });
    }

    // Check if email already exists and is verified
    let emailExist = await Email.findOne({ email }).exec();
    if (emailExist && emailExist.isVerified) {
        return res.status(200).json({
            choices: [{
                message: { content: `${email} is already subscribed!` }
            }],
            status: 400
        });
    }

    try {
        // Generate a random verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Store subscription data in Redis with 24-hour expiry
        const subscriptionData = {
            email,
            frequency: frequency || 'weekly',
            from: from || '',
            user_id: user_id || ''
        };
        
        await new Promise((resolve, reject) => {
            cache.set(
                `subscription:${verificationToken}`, 
                JSON.stringify(subscriptionData), 
                24 * 60 * 60, // 24 hours expiry
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        // Send verification email with only the token
        const verificationUrl = `${config.baseUrl}/admin/verify-email/${verificationToken}`;
        await new Promise((resolve, reject) => {
            res.render('email/verifyEmail', {
                layout: null,
                verificationUrl
            }, async (err, html) => {
                if (err) {
                    console.error('Error rendering verification email:', err);
                    reject(err);
                    return;
                }
                try {
                    await mailService.send(email, "Verify Your Newsletter Subscription", html);
                    resolve();
                } catch (ex) {
                    mailService.mailError('Verification email failed', __filename, ex);
                    reject(ex);
                }
            });
        });

        return res.status(200).json({
            choices: [{
                message: { content: 'Please check your email to verify your subscription. The verification link will expire in 24 hours.' }
            }],
            status: 200
        });
    } catch (error) {
        console.error('Subscription error:', error);
        return res.status(200).json({
            choices: [{
                message: { content: 'An error occurred. Please try again later.' }
            }],
            status: 400
        });
    }
  },
  verifyEmail: async (req, res) => {
    try {
        const { token } = req.params;
        
        // Get subscription data from Redis
        const subscriptionData = await new Promise((resolve, reject) => {
            cache.get(`subscription:${token}`, (err, data) => {
                if (err) reject(err);
                else resolve(data ? JSON.parse(data) : null);
            });
        });
        
        if (!subscriptionData) {
            req.flash('error', 'Invalid or expired verification link. Please try subscribing again.');
            return res.redirect('/issues');
        }

        // Check if email exists (verified or not)
        const existingEmail = await Email.findOne({ email: subscriptionData.email });
        
        if (existingEmail) {
            if (existingEmail.isVerified) {
                req.flash('error', 'This email is already subscribed to our newsletter.');
                return res.redirect('/issues');
            }
            
            // Update existing unverified email
            await Email.updateOne(
                { _id: existingEmail._id },
                {
                    isVerified: true,
                    verified_at: new Date(),
                    frequency: subscriptionData.frequency,
                    from: subscriptionData.from,
                    user: subscriptionData.user_id,
                    unsubscribe: false
                }
            );
        } else {
            // Create new verified subscriber if email doesn't exist
            const newSubscriber = new Email({
                email: subscriptionData.email,
                isVerified: true,
                verified_at: new Date(),
                frequency: subscriptionData.frequency,
                from: subscriptionData.from,
                user: subscriptionData.user_id,
                unsubscribe: false
            });
            await newSubscriber.save();
        }
        
        // Delete the temporary data from Redis
        cache.del(`subscription:${token}`);

        req.flash('success', 'Email verified successfully! You are now subscribed to our newsletter.');
        res.redirect('/issues');
    } catch (error) {
        console.error('Verification error:', error);
        req.flash('error', 'An error occurred during verification. Please try again.');
        res.redirect('/issues');
    }
  },
  makeArticle: (req,res)=>{
      let user = req.user;
      let isAdmin = false;
      if(user){
          user = user.processUser(user);
          isAdmin = user.admin;
      }

        res.render('form/post', {
            isAdmin,
              user: req.user.processUser(req.user),
              messages: {
                    error: req.flash('error'),
                    success: req.flash('success'),
                    info: req.flash('info'),
              },                  

        });
   },

  getPostEdit:  async function (req, res) {
       const post_id = req.params.post_id;
       let [err,post] = await asyncErrHandle(Post.findOne({'_id': post_id}).populate('tags')) ;

        let tags = post.tags;//an array of objectId which could be populated
       // console.log(`after populated post.tags:${JSON.stringify(post.tags) }`)
        let tagsArray = [];
             
              tags.forEach(e => {
                    tagsArray.push(e.name);  
              });


              res.render('form/editPost', {
                    user: req.user ? req.user.processUser(req.user) : req.user,
                    post: post.processPost(post),
                    tagArrayString: tagsArray,
                    messages: {
                          error: req.flash('error'),
                          success: req.flash('success'),
                          info: req.flash('info'),
                    },                  
  
              });
  },
postArticle: async (req,res)=>{

    const user = req.user;
      //     title = req.body.title,
      //     content = req.body.content,
      //     tags = req.body.tags,
      //     category = req.body.category,
      //     intro = req.body.intro;
    const post = new Post();
//     logger.debug("req.files"  + JSON.stringify(req.files))
//     if(req.files || req.files.topIMG) {
//       post.topIMG = req.files.topIMG.name;
//     }
//     if (!req.files || !req.files.topIMG) {
//       // Handle the case when no file is uploaded
//       return res.status(400).send('No file uploaded');
//     }

let uploadDir = config.uploadDir + 'articles/thumbnail';
util.checkDir(config.uploadDir);
util.checkDir(uploadDir);
const form =  new IncomingForm({
    multiples: false,
    maxFileSize: 5242880,  /**5 * 1024 * 1024 (5mb)**/
    keepExtensions: true,
    uploadDir: uploadDir,
    allowEmptyFiles: false,
    minFileSize: 1,/* 1 byte*/
    filename: function(name, ext, part, form){
      const timestamp = new Date().getTime();  
      const seconds = Math.floor(timestamp / 1000);
      name = `${seconds}-${name}`;
      return name;
    },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
});

form.parse(req,(err,fields,file)=>{
   console.log(`file + ${JSON.stringify(file)}`);
   let filename = file.topIMG[0].newFilename;
//    console.log(`filename + ${fields.topIMG}`)

   post.topIMG = filename;
   let title = util.trim(xss(fields.title[0] ? fields.title[0] : '')),
      content = util.trim(xss(fields.title[0] ? util.removeBlankFromText(fields.content[0]) : '')),
      category =   util.trim(xss(fields.category ? fields.category[0] : '')),
      subcategory = util.trim(xss(fields.subcategory ? fields.subcategory[0] : '')),
      tags = util.trim(xss(fields.tags ? fields.tags[0] : '')),
      intro = util.trim(xss(fields.intro[0] ? fields.intro[0] : '')),
      seoTitle = util.trim(xss(fields.seoTitle ? fields.seoTitle[0] : '')),
      seoKeywords = util.trim(xss(fields.seoKeywords ? fields.seoKeywords[0] : '')),
      seoDescription = util.trim(xss(fields.seoDescription ? fields.seoDescription[0] : '')),
      pathName = util.trim(xss(fields.pathName ? fields.pathName[0] : ''));

   post.author = user._id;
   post.user_id = user._id;
   post.title = title;
   post.tagsString = tags;
   post.categoryString = category;
   post.pathName = pathName;
   logger.debug("post.title: "+post.title);
    post.title_changed = util.urlBeautify(title);
    post.content = content;
    post.intro = intro;
    post.seoTitle = seoTitle;
    post.seoKeywords = seoKeywords;
    post.seoDescription = seoDescription;
   // post.category = category;

    post.save(async (err,post)=>{
          if(err){
                logger.error('post save error: ' +  err);
                req.flash('error',`there is some errors when save the post ${err}`);
                res.redirect('back');
           }else{

            let product_id = post._id;
            let cat = {};
            cat.catName= category;  cat.subcatName = subcategory;
            await postProxy.saveCategory(req, res, cat, Category,Post,product_id,'category');
            await postProxy.saveCategory(req, res, cat, Subcategory,Post,product_id,'subcategory');
                //new tag and save post     req, res, id,tags, PostModel,PostModelTag
                tagProxy.saveSingle(post._id, tags, Post, ArticleTag,'','');

                logger.info(`your post saved successfully: ${post._id}`);
                req.flash('success','Your post saved successfully');
                res.redirect('/article/' + post.pathName);
          }
    });




});







},
editPost: (req,res)=>{

  const  post_id = req.params.post_id,
         title = req.body.title,                
         tags = req.body.tags,
         category = req.body.category,
         intro = req.body.intro,
         content = req.body.content;


    const options = {
          //author: user.username;
          //user_id: user._id;
          title: title,
          content: content,
          intro: intro,
          //tags: req.body.tags,
          //Post.tags = tags.split(',');
          category: category,
    };
    
    //new: bool - if true, return the modified document rather than the original. defaults to false (changed in 4.0)
    //Finds a matching document, updates it according to the update arg, passing any options, and returns the found document (if any) to the callback. The query executes immediately if callback is passed else a Query object is returned.
    //Model.findOneAndUpdate([conditions], [update], [options], [callback])
    //http://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
    Post.findOneAndUpdate({'_id': post_id}, {$set: options}, {new: true},function(err, post) {
          if(err){
                console.log(err);
                next(err);
          }else{
                 
                 res.redirect('/post/show/'+ post.title);

          }
    });            




},

deletePost: (req,res)=>{
   const post_id = req.params.post_id;
    Post.remove({ '_id': post_id }, (err)=>{
          if(err){
                console.log(`there is an error when removing the post : ${err}`);
                req.flash('error','删除文章错误！');
                res.redirect('back');
          }else{
                console.log(`The post with id of ${req.params.post_id} deleted successfully `);
                req.flash('success','文章已删除!');
                res.redirect('back');
          }
    });

},

comment: (req,res)=>{
   const content = req.body.content,
         title = req.body.title,
         user = req.user.processUser(req.user),
         author = user.username,
         user_id = user._id;
 console.log(`title is : ${title}`);
  Post.findOne({'title':title}, (err,post)=>{
         if(err){
               console.log(err);
               req.flash('error',`there is some errors when finding the post by its title ${err}`);
               res.redirect('back');                       
         }else{
                const post_id = post._id; 
                
                const comment = new Comment();
                comment.content = content;
                comment.author = author;
                comment.user_id = user_id;
                comment.post_id = post_id;

                comment.save((err)=>{
                      if(err){
                            console.log(err);
                            req.flash('error',`there is some errors when save the post ${err}`);
                            res.redirect('back');                       
                      }else{
                            console.log('comment saved successfully');
                            req.flash('success','comment saved successfully');
                            res.redirect('back');
                      }
                });                       
         }              
  });   
}
}