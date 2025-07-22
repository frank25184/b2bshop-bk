"use strict";
// let moment = require('moment'),
//     config  = require('../common/get-config'),
//     Mail = require('nodemailer/lib/mailer');
    let Order = require('../models/Order');
    let seo = require('../config/seo');
    let util = require('../libs/utility');
    let mongoose = require('mongoose');
    let xss = require('xss');

module.exports = {
    billing: async (req,res) => {
        let orderInfo = req.body;
        let user = user = req.user._id; 
        let order = new Order(orderInfo);
        let info;
        order.save((err) => {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('back');
            }
            info = "Thank you for your order. We'll contact you soon.Cheers!";
            req.flash('success', 'Order placed successfully');
            res.redirect('/order/submitInfo');
        });
        
       // console.log("items: "+ JSON.stringify(items));
        res.render('order/submitInfo', {
            seo: {
                title: `Submit Info`,
                keywords: `Submit Info`,
                description: `Submit Info`,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
             user: req.user.processUser(req.user),
             info,
             messages: {
                   error: req.flash('error'),
                   success: req.flash('success'),
                   info: req.flash('info'),
             }
        })
    },
    getCheckout: async (req,res) => {
         res.render('order/checkout', {
              seo: {
                  title: `Sumbit an Product`,
                  keywords: `submit an Product`,
                  description: `Submit an Product! `,
              },
              env:{
                  cspNonce: res.locals.cspNonce
              },
               user: req.user.processUser(req.user),
               messages: {
                     error: req.flash('error'),
                     success: req.flash('success'),
                     info: req.flash('info'),
               }            

         });
    },

    postCheckout: async (req,res) => {
        let order = req.body;
        order.user = req.user._id;
         let result = {};        
         let items = order.items;
        result.status = 'pending';
        result.createdAt = new Date();
        result.updatedAt = new Date();
        if(!items || items.length === 0) {
            req.flash('error', 'No items in cart');
            return res.redirect('back');
        }
       // console.log("items: "+ JSON.stringify(items));
        result.items = items;
        res.render('order/checkout', {
          result,
          seo: {
            title: `Checkout`,
            keywords: `Checkout`,
            description: `Checkout`,
        },
        env:{
            cspNonce: res.locals.cspNonce
        },
         user: req.user.processUser(req.user),
         messages: {
               error: req.flash('error'),
               success: req.flash('success'),
               info: req.flash('info'),
         }   
        });
        
    }

}