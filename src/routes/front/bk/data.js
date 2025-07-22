"use strict";
const express = require('express');
const router = express.Router();

const main = require('../../controllers/main');
const data = require('../../controllers/data.js');
const producthunt = require('../../../data/producthunt');

// router.get('/:dataFileName', data.insertBulkEx);

// router.get('/gpt/rewrite', data.rewriteDB);
// router.get('/changeString', data.changeString);
// router.get('/changeWriting', data.changeWriting);
// router.get('/changeCode', data.changeCode);
// router.get('/changePrompts', data.changePrompts);
// router.get('/changeSEO', data.changeSEO);

// router.get('/replaceURL', data.replaceURL);

// router.get('/insertDynamic', data.insertDynamic);


// router.get('/producthunt', data.producthunt);
router.get('/getData', producthunt.getData);
router.get('/mostFollowedLink', producthunt.mostFollowedLink);
//router.get('/screenshot', data.screenshot);






module.exports = router;
