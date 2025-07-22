"use strict";
const express = require('express'),
      router = express.Router(),
      user = require('../../controllers/user'),
      auth = require('../../middlewares/auth'),
      limit = require('../../libs/limit');



module.exports = function(app){
        // router.get('/reset/:token', user.getResetToken);
        // router.post('/reset/:token', user.postResetToken);
    // Redirect URLs from /ai-tools/:categoryName to /ai-:categoryName
    // app.get('/ai-tools/:categoryName', (req, res) => {
    //     const categoryName = req.params.categoryName.trim();
    //     const redirectUrl = `/ai-${categoryName.toLowerCase().replace(/\s/g, '-')}`;
    //     return res.redirect(301, redirectUrl);
    // });
    // app.get('/ai-', (req, res) => {
    //     return res.redirect(301, '/');
    // });

}







