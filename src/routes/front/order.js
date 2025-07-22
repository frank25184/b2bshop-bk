"use strict";
const express = require('express'),
      router = express.Router(),
      order = require('../../controllers/order'),
      visitTracker = require('../../middlewares/visitTracker'),
      auth = require('../../middlewares/auth'),
      crawlerFilter = require('../../middlewares/crawlerFilter');
     /// limit = require('../../libs/limit');
   //   auth = require('../../middlewares/auth');

router.get('/checkout', auth.isLoggedIn,crawlerFilter, visitTracker, order.getCheckout);
router.post('/postCheckout', auth.isLoggedIn, crawlerFilter, visitTracker, order.postCheckout);
router.post('/billing', auth.isLoggedIn, crawlerFilter, visitTracker, order.billing);


module.exports = router;