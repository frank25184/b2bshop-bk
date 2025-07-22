"use strict";
const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const main = require('../../controllers/main');
const user = require('../../controllers/user');
const visitTracker = require('../../middlewares/visitTracker');
router.get('/', visitTracker, main.home);
//router.get('/home', main.home2);
//for top/:gadgets, need to remove later
router.get('/products', visitTracker, main.products);
router.get('/articles', visitTracker, main.articles);
router.get('/profile/:username', visitTracker, user.profile);
router.get('/privacy-policy', visitTracker, main.privacyPolicy);
router.get('/terms', visitTracker, main.terms);

//sitemap generator daily
require('../../libs/sitemap')(router);

module.exports = router;
 