"use strict";
const express = require('express');
const router = express.Router();
const errors = require('../../controllers/errors');

router.get('/404', errors.err404);

module.exports = router;
