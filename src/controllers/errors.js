"use strict";
const  User = require('../models/User'),
      logger = require('../libs/logger'),
      utils = require('../libs/utility');


module.exports = {
    err404: async (req,res) => {
      let user = req.user;
      let isAdmin = false;
      if(user){
          user = user.processUser(user);
          isAdmin = user.admin;
      }
      
      res.render('errors/404', {
          layout: 'new',
          seo: {
              title: seo.err404.title,
              keywords: seo.err404.keywords,
              description: seo.err404.description,
          },
          user: req.user ? req.user.processUser(req.user) : req.user,
          isAdmin: isAdmin,
        // csrfToken: req.csrfToken(),
          messages: {
              error: req.flash('error'),
              success: req.flash('success'),
              info: req.flash('info'),
          }, // get the user out of session and pass to template
      }); //render 



}

}

