//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),

      Tag = require('./ProductTag'),
    //   Currency = require('../models/Currency'),
     util = require('../libs/utility'),
      moment = require('moment');

// create a schema
//The allowed SchemaTypes are:
// String
// Number
// Date
// Buffer
// Boolean
// Mixed
// ObjectId
// Array
var ipSchema = new Schema({
      user_id: [{ type: String, default: []}],
      ip: {
        type: String,
        required: true,
        unique: true
      },
      country: {
        type: String,
      },
      region: {
        type: String,
      },
      city: {
        type: String,
      },
      timezone: {
        type: String,
      },
      userAgent: [{
        type: String,
        default: []
      }],
      referer: [{
        type: String,
        default: []
      }],
      visitedUrl: [{
        type: String,
        required: true,
        default: []
      }],
      block: {type: Boolean, default: false}
    //   createdAt: {
    //     type: Date,
    //     default: Date.now,
    //   },
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

ipSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};


ipSchema.methods.processIP = ip=>{
    return {
        _id:ip._id,
        ip: ip.ip,
        user_id: ip.user_id,
        country: ip.url,
        region: ip.region,
        hidden: ip.hidden,
        city: ip.city,
        timezone: ip.timezone,
        userAgent: ip.userAgent,
        referer: ip.referer,
        visitedUrl: ip.visitedUrl,

        created_at: site.time(ip.created_at),
        updated_at: site.time(ip.updated_at),            
    };
};


// siteSchema.methods.posts = site=>{

//          Post.findById(site.post_id).exec((err,post)=>{
//                 if(err){
//                     console.log(`cannot catch user,error: ${err}`);
//                     req.flash('error',`error in find user for ${user_id}`);
//                     res.redirect('back');							
//                 }else{
//                     console.log(post);
//                     let modifiedPost = post.processPost(post)
//                     console.log(modifiedPost);
//                     fn(modifiedPost);
                  
//               }
//         });

// };


ipSchema.methods.user = (user_id,fn)=>{
          
    User.findById(user_id).exec((err,user)=>{
           if(err){
               console.log(`cannot catch user,error: ${err}`);
               req.flash('error',`error in find user for ${user_id}`);
               res.redirect('back');							
           }else{
               console.log('user is '+user);
               let modifiedUser = user.processUser(user)
               console.log(modifiedUser);
               fn(modifiedUser);
             
         }
   });

};

ipSchema.methods.comments = (site_id,fn)=>{
Comment.find({'site_id':site_id},function(err,comments){
   comments =  comments.map(function(comment){
       return comment.processComment(comment);
   });
   fn(comments);
});
};







// make this available to our users in our Node applications
module.exports = mongoose.model('IP', ipSchema);