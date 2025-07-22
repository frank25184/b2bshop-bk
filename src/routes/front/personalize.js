"use strict";
const express = require('express');
const router = express.Router();

const tool = require('../../controllers/tool');
const auth = require('../../middlewares/auth');

const main = require('../../controllers/main');
var cors = require('cors')

//sitemap generator daily
require('../../libs/sitemap')(router);
/* GET home page. */
router.get('/', main.home);

// router.get('/sitemap.xml', function(req, res) {
//     res.sendFile(path.join(__dirname, '../public', 'sitemap.xml'))});

// router.get('/ai-tools', tool.allCategories);//all the categories
router.get('/ai-:category', tool.category);//one categories   change to /video-editing style
router.get('/tool/:name', tool.showTool); 
// router.post('/tool/submit', auth.isLoggedIn, tool.submitSite);

router.get('/bots', main.bots);

// router.get('/about', main.about);

module.exports = router;
