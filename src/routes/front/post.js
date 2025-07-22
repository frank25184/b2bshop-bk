"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../../middlewares/auth'),
      post = require('../../controllers/post'),
      image_upload = require('../../libs/image-upload');

router.get('/:pathName', post.showPost);
// router.get('/search', post.getSearch);

// router.get('/:user_id',post.getPersonalPosts);
router.get('/modify/:pathName', post.getModify);
router.post('/modify/:pathName', post.postModify);
// router.post('/delete/:post_id', post.delete);

module.exports = router;






