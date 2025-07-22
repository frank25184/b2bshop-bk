//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),

      Tag = require('./ProductCategory'),
      Category = require('./ProductCategory'),
      Subcategory = require('./ProductSubcategory'),
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
var productSchema = new Schema({
          user_id: { type: String},
          author: { type: Schema.Types.ObjectId, ref: 'User' },     //谁发的文章
        //  bests: [{ type: Schema.Types.ObjectId, ref: 'Best' }],    //用来导航当个网站介绍里，最后的联系best文章
          name: { type: String, required: true,unique:true}, //必须和best里的site name保持一致
          // tagsString: {type: String},//// for bulk import and for beautifying link
          //category: {type: String}, //for categories
          category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            //required: true
          },
          subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            //required: true
          },
         tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],//[String]//供提交页面调用 每个具体的网站
         tagsString: { type: String},
         availability: { type: String, required: true},

          producthuntUrl: {type: String},
          upvoteCount: {type: Number, default: 0},
          upvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          downvoteCount: {type: Number, default: 0},
          downvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          bookmarkUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          bookmarkCount: {type: Number, default: 0},
         // colletCount: {type: Number, default: 0},
          imgs: [{ type: String}],
        //  newFeatures: [String],
          name_changed:  { type: String, required: true,unique:true},
        //  pricing: [String],
          socialLinks: [String],
          sponsorOfTheDay:  { type: Boolean},
          startingPrice:   {type: Number},
          priceCurrent: { type: String},
          features: [{ type: String }], // List of key features
          releaseDate: { type: Date }, // Release date of the gadget
          brand: { type: String }, // Brand or manufacturer

          brief: { type: String},
          intro: { type: String},

          logo: { type: String},    
          verified:  { type: Boolean},
        //  verifiedReason: { type: String},    
          top:  { type: Boolean},
        //  free_trial:{ type: String},
          active_since: {type: Number},

          pros:  [String],
          cons: [String],

          down: {type: Boolean, default: false},

          youtube:  { type: String},
          twitter: { type: String},
          telegram: { type: String},
          discord: { type: String},
          github: { type: String},

          pv: {type: Number, default: 0},
          hidden: {type: Boolean, default: false},
          great:{type: Boolean, default: false},

          websiteUrl: String,
          buyingUrl:String,
          sendMail:  {type: Boolean, default: false}


}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

productSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};


productSchema.methods.processSite = site=>{

    let briefNoTag;
    if(site.brief){
        briefNoTag = site.brief.replace(/(<([^>]+)>)/gi, '');
    }
    let tagsArray = [];
    if (site.tagsString && site.tagsString.includes(',')) {
        tagsArray = site.tagsString.split(',');
        console.log(`site.tagsArray: ${tagsArray}`)
     } else {
       tagsArray = site.tagsString ? [site.tagsString] : []; 
       console.log(`site.tagsArray: ${tagsArray}`)
     }

    return {
        _id:site._id,
        isGadget:true,
        user_id: site.user_id,
        author: site.author,
        name: site.name,
        url: site.url,
        tags: site.tags,
        features: site.features,
        aiGenerated: site.aiGenerated,
        //producthuntUrl: site.producthuntUrl,
        tagsString: site.tagsString,//only for bulk import
        tagsArray,
        availability: site.availability,
        category: site.category,
        subcategory: site.subcategory,
       // favCount: site.favCount,
        upvoteCount: site.upvoteCount, 
        upvoteUser: site.upvoteUser,
        downvoteCount: site.downvoteCount, 
        downvoteUser: site.downvoteUser,
        bookmarkUser: site.bookmarkUser,
        bookmarkCount: site.bookmarkCount,
       // colletCount: site.colletCount,
        imgs: site.imgs,
       // imgOriginal: site.imgOriginal,
       // newFeatures: site.newFeatures,
       // pricing: site.pricing,
        name_changed: site.name_changed,
        socialLinks: site.socialLinks,
        sponsorOfTheDay: site.sponsorOfTheDay,
        startingPrice: site.startingPrice,
        priceCurrent: site.priceCurrent,
        releaseDate: site.releaseDate,
        brand: site.brand,
        brief: site.brief,
        intro: site.intro,
        briefNoTag,
        logo: site.logo,
       // verified: site.verified,
       // verifiedReason: site.verifiedReason,
        active_since: site.active_since,

        pros: site.pros,
        cons: site.cons,
        top: site.top,
        down: site.down,
        free_trial: site.free_trial,
        websiteUrl: site.websiteUrl,
        buyingUrl: site.buyingUrl,

        youtube:site.youtube,
        twitter: site.twitter,
        newFeatures: site.newFeatures,

        pv: site.pv,
        like: site.like,
        hidden: site.hidden,
        great: site.great,
        sendMail: site.sendMail,

        created_at: site.time(site.created_at),
        updated_at: site.time(site.updated_at),            
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


productSchema.methods.user = (user_id,fn)=>{
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

productSchema.methods.comments = (site_id,fn)=>{
Comment.find({'site_id':site_id},function(err,comments){
   comments =  comments.map(function(comment){
       return comment.processComment(comment);
   });
   fn(comments);
});
};







// make this available to our users in our Node applications
module.exports = mongoose.model('Product', productSchema);