"use strict";
const  User = require('../models/User'),
      logger = require('../libs/logger'),
      DailyNews = require('../models/CurrentNews'),
     // news = require('..//news'),
     dailyNewsProxy = require('../db_proxy/currentNews'),
     
      utils = require('../libs/utility');

const seo = require('../config/seo');
// const Category = require('../models/Category');
module.exports = {
   showOne: async (req,res) => {
    let user = req.user;
    let isAdmin = false;
    if(user){
        user = user.processUser(user);
        isAdmin = user.admin;
    }
    let tertiaryPath = req.params.tertiaryPath;  
    dailyNewsProxy.getNewsByTitle(req,res,tertiaryPath,'news/showCurrentNews'); 
   }


}

