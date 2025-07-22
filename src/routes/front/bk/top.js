"use strict";
const express = require('express'),
      router = express.Router(),
      top = require('../../controllers/top'),
      visitTracker = require('../../middlewares/visitTracker');
     // limit = require('../../libs/limit');
   //   auth = require('../../middlewares/auth');


router.get('/:tertiaryPath',visitTracker, top.showProducts);

module.exports = router;
