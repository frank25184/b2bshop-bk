"use strict";
const express = require('express'),
      router = express.Router(),
      auth = require('../../middlewares/auth'),
      visitTracker = require('../../middlewares/visitTracker'),
      api = require('../../controllers/api');


// router.get('/searchAlternative',visitTracker, api.searchAlternative);
router.post('/getProductsByCategory',visitTracker, api.getProductsByCategory);
// router.get('/getCategories', api.getCategories);
// router.get('/getItems', api.getItems);

//news
router.get('/getCurrentNews',visitTracker, api.getCurrentNews);
module.exports = router;