"use strict";
const express = require('express');
const router = express.Router();
const product = require('../../controllers/product');

router.get('/:tag', product.showTag);
module.exports = router;