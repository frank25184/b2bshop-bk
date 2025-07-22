"use strict";

const flash        = require('connect-flash'),
    config  = require('../common/get-config'),
    mailService  = require('../libs/mail')(config),
    seo = require('../config/seo'),
    productProxy = require('../db_proxy/product'),
    User = require("../models/User"),
  //  Product= require("../models/Product"),
    Contact= require("../models/Contact"),
    util = require('../libs/utility'),
    logger =  require('../libs/logger');

module.exports = {
    contact:async (req, res) => {
        let user = req.user;
        res.render('form/contact', {user:user});
    },
    postContact: async  (req, res) => {
        logger.info(`postContact: ${JSON.stringify(req.body)}`)
        const { name, email, message } = req.body;
        let contact,user = req.user;
        let mailList = config.adminMailList;
        contact = new Contact();
        if(user){
            contact.name = name;
            contact.email = email;
            contact.message = message;
            contact.user = user._id;
        }else{ 
            contact.name = name;
            contact.email = email;
            contact.message = message;
        }
        try {
            await contact.save();
            // await mailService.sendContactEmail(name, email, message);
            res.render('email/notifyMessage',
                {layout:null, user:user, name: name, email: email, message: message}, (err,html)=>{
                    if(err){console.log('err in email template', err);}
                    try{
                        mailService.sendToGroup(mailList, `Quote from ${name}`,html);
                    }catch(ex){
                        mailService.mailError('The email widget broke down!', __filename,ex);
                    }
                }
               );
             res.json({success:true, message: 'Thank you for your message! We will get back to you as soon as possible.'});
            // req.flash('success', 'Thank you for your message! We will get back to you as soon as possible.');
            // res.redirect('back');
        } catch (error) {
            console.error('Error sending contact email:', error);
            res.json({success:false, message: 'Failed to send message. Please try again later.'});
        }
    },
    verify: async (req, res) => {
        const verificationToken =  req.params.token;
        const username = req.query.username;
        try {
            let user = await User.findOne({username, verificationToken }).exec();  //in userback should have verificationToken value
            if (!user) {
                return res.status(400).send('Invalid verification token.');
            }
            //if there is userBack Create a new user in the User model
            await User.findOneAndUpdate({"_id": user._id }, {isVerified: true}).exec();
            // const newUser = new User({
            //     email: userBack.email,
            //     password: userBack.password ? userBack.password : '',
            //     username: userBack.username,
            //     username_changed: util.urlBeautify(userBack.username),
            //     isVerified: true // Set as verified
            // });
            // let user = await newUser.save();
            // 
            req.flash('success','Congrats.Email Verified!');
            return res.redirect('/user/profile/'+ user._id);
            
        } catch (error) {
            if (err) {return res.status(400).send('Invalid verification token.');}
        }
    },
    bookmark: async (req,res)=>{
        let user = req.user;
        let isAdmin = false;
        let siteId = req.query.siteId ? req.query.siteId : ''; 
        let result = { success: false };

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            console.log('into bookmark and user login')
            let isBookmark;
            // Check if already bookmarked
           if(siteId){
                isBookmark = util.userBookmark(user, siteId, 'site');
            }

            // If already bookmarked, remove bookmark
            if(isBookmark){
                try {
                    if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$pull: {sitesBookmark: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $pull: {bookmarkUser: user._id},
                            $inc: {bookmarkCount: -1}
                        }).exec();
                    }
                    result.success = true;
                    result.isBookmarked = false;
                } catch (error) {
                    console.log(`Error removing bookmark: ${error}`);
                    result.error = 'Error removing bookmark';
                }
            } else {
                // Add new bookmark
                try {
                    if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$addToSet: {sitesBookmark: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $addToSet: {bookmarkUser: user._id},
                            $inc: {bookmarkCount: 1}
                        }).exec();
                    }
                    result.success = true;
                    result.isBookmarked = true;
                } catch (error) {
                    console.log(`Error adding bookmark: ${error}`);
                    result.error = 'Error adding bookmark';
                }
            }
        } else {
            result.error = 'User not logged in';
        }
        
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            res.json(result);
        } else {
            res.redirect('back');
        }
    },
    upvote:async (req,res)=>{
         let user = req.user;
         let isAdmin = false;
         let result = { success: false };

         if(user){
             user = user.processUser(user);
             isAdmin = user.admin;
             console.log('into upvote and user login')
             let isUpvote, isDownvote;
             
             // Check if already downvoted
             if(siteId){
                isDownvote = util.userDownvote(user, siteId, 'site');
             }

             // If already downvoted, remove downvote
             if(isDownvote) {
                try {
                   if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$pull: {sitesDownvoted: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $pull: {downvoteUser: user._id},
                            $inc: {downvoteCount: -1}
                        }).exec();
                    }
                } catch (error) {
                    console.log(`Error removing downvote: ${error}`);
                    result.error = 'Error removing downvote';
                }
             }

            if(siteId){
                isUpvote = util.userUpvote(user,siteId, 'site');
             }
             
             if(isUpvote){//if user has upvoted,then remove data
                try {
                    if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$pull: {sitesUpvoted: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $pull: {upvoteUser: user._id},
                            $inc: {upvoteCount: -1}
                        }).exec();
                    }
                    result.success = true;
                    result.isUpvoted = false;
                } catch (error) {
                    console.log(`Error removing upvote: ${error}`);
                    result.error = 'Error removing upvote';
                }
             }else{ //if user hasn't upvoted,then insert data
                try {
                    if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$addToSet: {sitesUpvoted: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $addToSet: {upvoteUser: user._id},
                            $inc: {upvoteCount: 1}
                        }).exec();
                    }
                    result.success = true;
                    result.isUpvoted = true;
                } catch (error) {
                    console.log(`Error adding upvote: ${error}`);
                    result.error = 'Error adding upvote';
                }
             }
         } else {
             result.error = 'User not logged in';
         }
         
         if (req.xhr || req.headers.accept.indexOf('json') > -1) {
             res.json(result);
         } else {
             res.redirect('back');
         }
    },
    downvote:async (req,res)=>{
        let user = req.user;
        let isAdmin = false;
        let siteId = req.query.siteId ? req.query.siteId : '';
        let result = { success: false };

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            console.log('into downvote and user login')
            let isUpvote, isDownvote;
            
            // Check if already upvoted
           if(siteId){
                isUpvote = util.userUpvote(user, siteId, 'site');
            }

            // If already upvoted, remove upvote
            if(isUpvote) {
                try {
                    if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$pull: {sitesUpvoted: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $pull: {upvoteUser: user._id},
                            $inc: {upvoteCount: -1}
                        }).exec();
                    }
                } catch (error) {
                    console.log(`Error removing upvote: ${error}`);
                    result.error = 'Error removing upvote';
                }
            }

            if(siteId){
                isDownvote = util.userDownvote(user,siteId, 'site');
            }
            
            if(isDownvote){
                try {
                    if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$pull: {sitesDownvoted: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $pull: {downvoteUser: user._id},
                            $inc: {downvoteCount: -1}
                        }).exec();
                    }
                    result.success = true;
                    result.isDownvoted = false;
                } catch (error) {
                    console.log(`Error removing downvote: ${error}`);
                    result.error = 'Error removing downvote';
                }
            }else{
                try {
                    if(siteId){
                        await User.findOneAndUpdate({_id: user._id}, {$addToSet: {sitesDownvoted: siteId}}).exec();
                        await Site.findOneAndUpdate({_id: siteId}, {
                            $addToSet: {downvoteUser: user._id},
                            $inc: {downvoteCount: 1}
                        }).exec();
                    }
                    result.success = true;
                    result.isDownvoted = true;
                } catch (error) {
                    console.log(`Error adding downvote: ${error}`);
                    result.error = 'Error adding downvote';
                }
            }
        } else {
            result.error = 'User not logged in';
        }
        
        res.json(result);
    },
    signup: (req,res)=>{
        //render the page and pass in any flash data if it exists, req.flash is provided by connect-flash
            req.user = '';//????
            res.render('form/signup', { 
                seo: {
                    title: seo.signup.title,
                    keywords: seo.signup.keywords,
                    description: seo.signup.description,
                },
                data: {
                   // weeklyRec
                },
                messages: {
                    error: req.flash('error'),
                    success: req.flash('success'),
                    info: req.flash('info'),
                }, 
                user: req.user ? req.user.processUser(req.user) : req.user,
            });
    },

    login: (req,res)=>{
        //render the page and pass in any flash data if it exists
           // let weeklyRec = yield Project.findOne({weeklyRecommend: true}).exec();
           //req.user = req.user ? req.user : null;
            res.render('form/login', { 
                seo: {
                    title: seo.login.title,
                    keywords: seo.login.keywords,
                    description: seo.login.description,
                },
                data: {
                    //weeklyRec
                },
                messages: {
                    error: req.flash('error'),
                    success: req.flash('success'),
                    info: req.flash('info'),
                }, 
                user: ''//req.user ? req.user.processUser(req.user) : req.user,
            });


    },
    profile: async (req, res)=> {
        let profile_user;
       // let isAdmin = false;
        let username_changed = req.params.username || '';
        console.log('into profile username: '+ username_changed)
        let user_id = req.params['user_id'] ||'';  
        console.log('into profile function,user_id: '+ user_id)
    
        try {
            if(username_changed){
                console.log(`username exist`)
                profile_user = await User.findOne({username_changed}).exec();
                user_id = profile_user ? profile_user._id : '';
           }else if(user_id){
            console.log(`userid exist`)
            profile_user = await User.findOne({_id:user_id}).exec();
            user_id = profile_user ? profile_user._id : '';
            console.log(`user: ${JSON.stringify(profile_user)}`);
           }
           if(!user_id){
               console.log('into if(!user_id)')
           }else{
               console.log('into if(!user_id)..else')
               productProxy.getProductsByUserId(req,res,user_id,'users/profile');
           }
        } catch (err) {
               logger.error('Error getting the user: '+ err);
                res.redirect('back')
        }

        

       // User.findOne({id: user_id},function(err, user){
            // if(err){
            //     logger.error('Error getting the user'+ err).
            //     res.redirect('back')
            // }
            // if(user){
            //     postProxy.getPostsByUserId(req,res,user_id,'users/profile');
            // }else{
            //     res.redirect('back')
            // }
      //  })

        // User.findById(user_id).exec((err,user)=>{
        //     if(err){
        //         console.log(`cannot catch user,error: ${err}`);
        //         req.flash('error',`error in find user for ${user_id}`);
        //         res.redirect('back');							
        //     }else{
        //         console.log(user);
        //         let modifiedUser = user.processUser(user);
        //         console.log(modifiedUser);
                
        //         res.render('users/profile',{
        //             postUser: modifiedUser
        //         });

        //   }
        // });



    },
    postSignup: passport=>{
        
        return function(req, res, next) {

            // User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
            //     if (err) {
            //         return res.render('/user/signup');
            //     }
        
            //     passport.authenticate('local')(req, res, function () {
            //         res.redirect('/');
            //     });
            // });
             passport.authenticate('local-signup', (err, user, info)=> {
               if (err) { 
                   logger.error('error:' + err.stack)
                   return next(err); 

                }else{
                           if (!user) {
                               req.flash('error', 'No such user exists'); 
                               return res.redirect('/user/signup'); 
                           }else{
                                console.log(`user: ${JSON.stringify(user)}`)
                                req.logIn(user, err=> {
                                           if (err) { 
                                            return next(err); 
                                           }
                                           res.render('email/verifyMessage',
                                            {layout:null, user:user}, (err,html)=>{
                                                if(err){console.log('err in email template', err);}
                                                try{
                                                    mailService.send(user.email,"Email Verification Required!",html);
                                                }catch(ex){
                                                    mailService.mailError('The email widget broke down!', __filename,ex);
                                                }
                                            }
                                           );
                                           req.flash('success',"Please check your email to verify your account.");
                                           return res.redirect('/profile/'+ user.username_changed);

                                });
                           }

               }

               

             })(req, res, next);
        };

   },
   postLogin: function(passport){
       return function(req,res,next){
               let user = req.user;
               if(user){
                req.flash('success','Already Logged In!')
                res.redirect('/profile/'+ user.username_changed);
               }
               passport.authenticate('local-login', (err, user, info)=>{
                       if (err) { 
                           logger.error(`post login error: ${err.stack}`)
                           return next(err); 
                        }
                       if (!user) { 
                           req.flash('error','Something wrong with the Password or email!')
                           res.redirect('/user/login'); 
                       }
                       req.logIn(user, function(err) {
                           if (err) { return next(err); }
                           req.flash('success','Login successfully!')
                           res.redirect('/profile/'+ user.username_changed);
                         // return res.redirect('back');
                       });        		
               })(req, res, next);
       };
    },
    postFileUpload: app=>{
        return function(req,res){
             let dataDir = config.uploadDir;
             // if(app.get('env')=== 'development' || app.get('env')=== 'test'){
                 //dataDir = config.uploadDir;
             // }else{
             // 	dataDir = config.uploadDir.production;
             // }

             console.log(dataDir);
             let photoDir = dataDir + 'logo/';
             //existsSync depreciated!! do not use it any more
             // fs.existsSync(dataDir)  || fs.mkdirSync(dataDir);
             // fs.existsSync(photoDir) || fs.mkdirSync(photoDir);

             //also can use:
             utils.checkDir(dataDir);
             utils.checkDir(photoDir);		
             // fs.access(dataDir, fs.constants.F_OK, function(err) {
             //     if (!err) {
             //         // Do something
             //         console.log(dataDir + 'the folder exits!')

             //     } else {
             //         // It isn't accessible
             //         fs.mkdirSync(dataDir);
             //     }
             // });
             // fs.access(photoDir, fs.constants.F_OK, function(err) {
             //     if (!err) {
             //         // Do something
             //         console.log(photoDir + 'the folder exits!')

             //     } else {
             //         // It isn't accessible
             //         fs.mkdirSync(photoDir);
             //     }
             // });			
             //fs.constants.F_OK - path is visible to the calling process. This is useful for determining if a file exists, but says nothing about rwx permissions. Default if no mode is specified.
             // fs.constants.R_OK - path can be read by the calling process.
             // fs.constants.W_OK - path can be written by the calling process.
             // fs.constants.X_OK - path can be executed by the calling process. This has no effect on Windows (will behave like fs.constants.F_OK).

             

             try{
                 //store the data to the database
                 //...
                 //console.info('Received contact from ' + req.user.username + " <" + req.user.email + '>' );
                 
                 const form = new formidable.IncomingForm();

                 form.parse(req,(err,fields,file)=>{

                     if(err){
                             req.flash('error','form parse error:' + err);
                             return res.redirect(500, '/response/err/500');
                     }else{
                             const photo = file.photo;
                             
                             let personalDir = `${req.user._id}/`;
                             let thedir = photoDir + personalDir;
                             //prevent uploading file with the same name



                             const photoName = req.user._id + photo.name; 
                             
                             const fullPath = thedir + photoName;

                             //checkDir need to be passed to have a callback so that the thedir is generated before the rename function being called
                             utils.checkDir(thedir,()=>{
                                 fs.rename(photo.path, fullPath, err=>{
                                     if (err) {console.log(err); return; }
                                     console.log('The file has been re-named to: ' + fullPath);
                                 });										
                             });

                             console.log('the dir is :' + thedir);
                             console.log(photo.name,photo.path,fullPath);
                             
                             //rename or move the file uploaded;and photo.path is the temp file Formidable give
                                             
                             if(req.user){
                                 function saveFileInfo(){
                                     
                                     const user = req.user;
                                     user.logo = photoName;
                                     user.save(err=>{
                                         if(err){throw err}
                                         req.flash('success','Upload your logo successfully');
                                         res.redirect('/profile/'+ user.username_changed);
                                     });

                                 }
                                 saveFileInfo();
                                 // req.flash('success', 'Uploading successfully!');
                                 // return res.xhr ? res.json({success: true}) :
                                 // res.redirect(303, '/success');
                             //  saveFileInfo('upload-photo', fields.email,req.params.year,fields.params.year,fields.params.month,path);
                             }else{
                                 console.log('user not login');
                                 req.flash('eror','You need to login first to upload your logo');
                                 res.redirect(303, '/user/login');
                             }								
                     }


                     //console.log('received fields:', fields);
                     //console.log('received files:', photo.name);

                 });


             } catch(ex){
                 return res.xhr ?
                     res.json({error: 'Database error.'}):
                     res.redirect(303, '/response/error/500');
             }
        };

    },
    logout: (req, res, next)=>{
        req.logout(function(err) {
            console.log(`into req.logout..`);
            if (err) { 
                console.log('error in logout '+JSON.stringify(err))
                return next('error in logout '+err); 
            }
            res.redirect('/');
          });      
    }
}