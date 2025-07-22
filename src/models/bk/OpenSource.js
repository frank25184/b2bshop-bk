//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),
     Category = require('.//OpenSourceCategory'),
     Subcategory = require('./OpenSourceSubcategory'),
     AlternativeTo = require('./AlternativeTo'),
     util = require('../libs/utility'),
      moment = require('moment');

var openSourceSchema = new Schema({
          user_id: { type: String},
          author: { type: Schema.Types.ObjectId, ref: 'User' },     //谁发的文章
        //  bests: [{ type: Schema.Types.ObjectId, ref: 'Best' }],    //用来导航当个网站介绍里，最后的联系best文章
          title: { type: String, required: true,unique:true}, //必须和best里的site name保持一致
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            // required: true // Uncomment if you want to enforce at least one category
        }],
        subcategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subcategory',
            // required: true // Uncomment if you want to enforce at least one subcategory
        }],
        alternativeTos:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'AlternativeTo' }], 
          upvoteCount: {type: Number, default: 0},
          upvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          downvoteCount: {type: Number, default: 0},
          downvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          bookmarkCount: {type: Number, default: 0},
          bookmarkUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
         // colletCount: {type: Number, default: 0},
          imgs: [{ type: String}],
        //  newFeatures: [String],
          title_changed:  { type: String, required: true,unique:true},
        //  pricing: [String],
          tertiaryPath: { type: String,required: true,unique:true},
          intro: { type: String},
          pros:  [String],
          cons: [String],          
          github: { type: String},
          features: [{ type: String }], 
          logo: { type: String},      
          top:  { type: Boolean},
          url: {type:String},
          languages: [{ type: String }], //programming langauge
          license: {type:String},
          youtube: {type:String},

          pv: {type: Number, default: 0},
          hidden: {type: Boolean, default: false},
          great:{type: Boolean, default: false},
          seoTitle:  { type: String, required: true },
          seoKeyword:  { type: String},
          seoDescription:  { type: String, required: true },

}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

openSourceSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};

openSourceSchema.methods.processOpen = site=>{

    let introNoTag;
    if(site.intro){
        introNoTag = site.intro.replace(/(<([^>]+)>)/gi, '');
    }
    return {
        _id:site._id,
        isSite:true,
        user_id: site.user_id,
        author: site.author,
        title: site.title,
        title_changed: site.title_changed,
        tertiaryPath: site.tertiaryPath,
        categories: site.categories,
        subcategories: site.subcategories,
        upvoteCount: site.upvoteCount, 
        upvoteUser: site.upvoteUser,
        downvoteCount: site.downvoteCount, 
        downvoteUser: site.downvoteUser,
        bookmarkCount: site.bookmarkCount, 
        bookmarkUser: site.bookmarkUser,
        imgs: site.imgs,
        intro: site.intro,
        introNoTag,
        logo: site.logo,
        url: site.url,
        pros:  site.pros,
        cons: site.cons,          
        github:site.github,
        features: site.features, 
        alternativeTo:site.alternativeTo,
        languages: site.languages, //programming langauge
        license: site.license,
        youtube: site.youtube,
        seoTitle: site.seoTitle,
        seoKeyword: site.seoKeyword,
        seoDescription: site.seoDescription,
        alternativeTos: site.alternativeTos,

        pv: site.pv,
        like: site.like,
        hidden: site.hidden,
        great: site.great,
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


openSourceSchema.methods.user = (user_id,fn)=>{
          
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

openSourceSchema.methods.comments = (site_id,fn)=>{
Comment.find({'site_id':site_id},function(err,comments){
   comments =  comments.map(function(comment){
       return comment.processComment(comment);
   });
   fn(comments);
});
};



// make this available to our users in our Node applications
module.exports = mongoose.model('OpenSource', openSourceSchema);