"use strict";
const express = require('express'),
      router = express.Router(),
      stage = require('../../controllers/stage'),
      visitTracker = require('../../middlewares/visitTracker');
// Apply visit tracking to specific route
router.get('/:stageSubca',visitTracker, stage.siteList(''));
module.exports = router;