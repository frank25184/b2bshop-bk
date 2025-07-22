"use strict";
const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const support = require('../../controllers/support');
//const user = require('../../controllers/user');
const visitTracker = require('../../middlewares/visitTracker');

router.get('/faq', visitTracker, support.faq);
router.get('/about', visitTracker, support.about);
router.get('/contact', visitTracker, support.contact);


module.exports = router;
