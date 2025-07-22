"use strict";
const  User = require('../models/User'),
//productProxy = require('../db_proxy/product'),
      logger = require('../libs/logger'),
      utils = require('../libs/utility');

const seo = require('../config/seo');
// const Category = require('../models/Category');
module.exports = {
    contact:async (req,res)=>{
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
        res.render('form/contact', {
            seo: {
                title: 'Contact Us',
                keywords: 'Contact Us',
                description: 'Contact Us',
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },
    about: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
        res.render('support/about', {
            seo: {
                title: 'About Us',
                keywords: 'About Us',
                description: 'About Us',
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },
    faq: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
        res.render('support/faq', {
            seo: {
                title: 'FAQ',
                keywords: 'Product FAQ',
                description: 'Product FAQ',
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            isAdmin: isAdmin,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }, // get the user out of session and pass to template
        }); //render 
    },



}

