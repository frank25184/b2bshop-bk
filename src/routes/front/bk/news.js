"use strict";
const express = require('express'),
      router = express.Router(),
      news = require('../../controllers/news');
     // limit = require('../../libs/limit');
   //   auth = require('../../middlewares/auth');


router.get('/:tertiaryPath', news.showOne);//start with a limit of around 10-30 requests per minute per IP addres
// router.post('/tool/submit', auth.isLoggedIn, tool.submitSite);

// router.get('/:name', tool.showTool);

module.exports = router;










// router.get('/modify/:post_id', post.getModify);
// router.post('/modify/:post_id', post.postModify);
// router.post('/delete/:post_id', post.delete);
// router.get('/search', post.getSearch);
//router.get('/:user_id',post.getPersonalPosts);