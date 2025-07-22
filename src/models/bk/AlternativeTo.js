//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),
     Category = require('.//OpenSourceCategory'),
     Subcategory = require('./OpenSourceSubcategory'),
     OpenSource = require('./OpenSource'),
     util = require('../libs/utility'),
      moment = require('moment');

var alternativeSchema = new Schema({
        user_id: { type: String},  
        author: { type: Schema.Types.ObjectId, ref: 'User' },     //谁发的文章
        name: { type: String, unique: true, required: true }, // Ensure names are unique
        name_changed:  { type: String, required: true,unique:true},
        opens: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OpenSource',
            required: true 
        }],
        upvoteCount: {type: Number, default: 0},
        upvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        imgs: [{ type: String}],
        intro: { type: String},
        logo: { type: String},      
        top:  { type: Boolean},
        pv: {type: Number, default: 0},
        hidden: {type: Boolean, default: false},
        great:{type: Boolean, default: false},
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

alternativeSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};

alternativeSchema.methods.processAlternative = site=>{

    let introNoTag;
    if(site.intro){
        introNoTag = site.intro.replace(/(<([^>]+)>)/gi, '');
    }
    return {
        _id:site._id,
        user_id: site.user_id,
        author: site.author,
        name: site.name,
        name_changed: site.name_changed,
        upvoteCount: site.upvoteCount, 
        upvoteUser: site.upvoteUser,
        imgs: site.imgs,
        intro: site.intro,
        introNoTag,
        logo: site.logo,
        url: site.url,
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


alternativeSchema.methods.user = (user_id,fn)=>{
          
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

alternativeSchema.methods.comments = (site_id,fn)=>{
Comment.find({'site_id':site_id},function(err,comments){
   comments =  comments.map(function(comment){
       return comment.processComment(comment);
   });
   fn(comments);
});
};



// make this available to our users in our Node applications
module.exports = mongoose.model('Alternative', alternativeSchema);