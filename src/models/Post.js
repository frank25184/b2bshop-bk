//./models/Post.js
// grab the things we need
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('../models/User'),
      Tag = require('../models/PostTag'),
      PostCategory = require('./PostCategory'),
      PostSubcategory = require('./PostSubcategory'),
      Comment = require('../models/Comment'),
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
var postSchema = new Schema({
          user_id: { type: String, required: true },        
          author: { type: Schema.Types.ObjectId, ref: 'User'},
          title: { type: String, required: true, min: 4 , unique:true},
          title_changed:  { type: String, required: true,unique:true},
          category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PostCategory',
            //required: true
          },
          subcategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'PostSubcategory',
            //required: true
          },
          seoTitle: { type: String, required: true, min: 4 },
          seoKeywords: { type: String, min: 4 },
          seoDescription: { type: String, required: true, min: 4 }, 
          pathName: { type: String, required: true },
          tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],
          content: { type: String, required: true, min:100 },//,match: /[0-9a-zA-Z_-]/
          intro: {type: String, required: true, min: 20},
          //comments: [{ body: String, date: Date }],
          topIMG:{ type: String, required: true},
          tagsString: {type: String},
          pv: {
            type: Number, default: 0,
            timestamps: {
                updated_at: false
            }
          },
          like: {type: Number, default: 0},
          hidden: {type: Boolean, default: 'false'},
          great:{type: Boolean, default: 'false'},
          meta: {
            votes: Number,
            favs:  Number
          }        
          // created_at: {type: Date, default: Date.now()},
          // updated_at: {type: Date, default: Date.now()},
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

//调用 pre('save') 告诉 Mongoose在执行 save() 之前先执行一个方法。
// schema.pre('save', function() {
//     // 在 save 中间件中，this 是正在保存的文档。
//     console.log('Save', this.name)
//   })

// // on every save, add the date
// postSchema.pre('save', function(next) {
//   // get the current date
//   const currentDate = new Date();
  
//   // change the updated_at field to current date: do not leave .local
//   this.updated_at = currentDate;

//   // if created_at doesn't exist, add to that field
//   if (!this.created_at){
//     this.created_at = currentDate;
//   }

//   next();
// });

postSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};
postSchema.methods.processPost = post=>{
    let tagsArray = [];
    if (post.tagsString && post.tagsString.includes(',')) {
        tagsArray = post.tagsString.split(',');
        console.log(`post.tagsArray: ${tagsArray}`)
     } else {
       tagsArray = post.tagsString ? [post.tagsString] : []; 
       console.log(`post.tagsArray: ${tagsArray}`)
     }
    return {
        _id:post._id,
        user_id: post.user_id,
        tagsObjectId: post.tags,  //an objectid which could be populated  
        tagsArray: tagsArray,//array with all post tags (string)
        author: post.author,
        category: post.category,
        subcategory: post.subcategory,
        tags: post.tags,
        title: post.title,
        title_changed: post.title_changed,
        intro: post.intro,
        content: post.content,  
        topIMG: post.topIMG,
        seoTitle: post.seoTitle,
        seoKeywords: post.seoKeywords,
        seoDescription: post.seoDescription,
        pathName: post.pathName,
        pv: post.pv,
        like: post.like,
        great: post.great,
        created_at: post.time(post.created_at),
        updated_at: post.time(post.updated_at),            
    };    

};

postSchema.methods.user = (user_id,fn)=>{
          
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

postSchema.methods.comments = (post_id,fn)=>{
    Comment.find({'post_id':post_id},function(err,comments){
        comments =  comments.map(function(comment){
            return comment.processComment(comment);
        });
        fn(comments);
    });



};



// make this available to our users in our Node applications
module.exports = mongoose.model('Post', postSchema);