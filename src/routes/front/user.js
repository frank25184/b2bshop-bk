"use strict";
const express = require('express'),
      router = express.Router(),
      user = require('../../controllers/user'),
      auth = require('../../middlewares/auth'),
      limit = require('../../libs/limit'),
      visitTracker = require('../../middlewares/visitTracker');



module.exports = function(app,User,passport){
        router.post('/postContact', visitTracker, user.postContact);	
       // router.get('/contact', auth.isLoggedIn,visitTracker, user.contact);	
        // router.get('/reset/:token', user.getResetToken);
        // router.post('/reset/:token', user.postResetToken);
       // router.get('/personalize', auth.isLoggedIn,  user.personalize);
        router.get('/signup',auth.notLoggedIn,visitTracker, user.signup);
        router.get('/login',auth.notLoggedIn,visitTracker, user.login);
       // router.get('/fileupload',auth.isLoggedIn, user.fileupload);
        // we will want this protected so you have to be logged in to visit
        // we will use route middleware to verify this (the isLoggedIn function)
       // router.get('/profile/:user_id',  user.profile); 
        router.get('/profile/:username',  visitTracker, user.profile);
        // router.get('/updateUser', auth.isLoggedIn, user.updateUser);
        // router.get('/forgotPassword', auth.notLoggedIn, user.forgotPassword);
        router.get('/logout', auth.isLoggedIn,visitTracker, user.logout);	
        router.post('/logout', auth.isLoggedIn,visitTracker, user.logout);	
        // router.post('/postForgotPassword', user.postForgotPassword(User));
        // router.post('/updateUser',auth.isLoggedIn, user.putUpdateUser(User));        
        router.post('/postSignup',visitTracker, user.postSignup(passport));        
        router.post('/postLogin',  visitTracker, user.postLogin(passport));
       // router.get('/mark',  auth.isLoggedIn, user.mark);
        //router.get('/upvote', auth.isLoggedIn, visitTracker, user.upvote);
       // router.get('/downvote', auth.isLoggedIn,visitTracker, user.downvote);
      //  router.get('/bookmark', auth.isLoggedIn,visitTracker, user.bookmark);
        router.get('/verify/:token',visitTracker, user.verify); 
        //router.post("/process/:year/:month", user.postFileUpload(app));        
        return router;
}
