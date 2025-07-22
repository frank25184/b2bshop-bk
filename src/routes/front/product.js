"use strict";
const express = require('express'),
      router = express.Router(),
      product = require('../../controllers/product'),
      visitTracker = require('../../middlewares/visitTracker'),
      crawlerFilter = require('../../middlewares/crawlerFilter');
     /// limit = require('../../libs/limit');
   //   auth = require('../../middlewares/auth');

//crawlerFilter
router.get('/:name', visitTracker, product.showProduct); // Protected against malicious crawling
// router.post('/tool/submit', auth.isLoggedIn, tool.submitSite);
router.get('/modify/:name_changed', product.getModify);
router.post('/modify/:name_changed', product.postModify);
// router.get('/:name', tool.showTool);

module.exports = router;



// router.post('/delete/:post_id', post.delete);
// router.get('/search', post.getSearch);
//router.get('/:user_id',post.getPersonalPosts);