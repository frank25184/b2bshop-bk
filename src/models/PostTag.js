//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('../models/User'),
      Post = require('../models/Post'),
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
var tagSchema = new Schema({
          //user_id: { type: String, required: true },
          posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],    
          name: { type: String, required: true},
          count: { type: Number, default: 0},
          intro:  { type: String}
   
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

tagSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};

tagSchema.methods.processTag = tag=>{

    let tagsArray = tag.split(',');
    return {
        _id:tag._id,
        user_id: tag.user_id,
        posts: tag.post,
        name: tag.name,
        tags: tagsArray, 
        intro: tag.intro,
        count: tag.count,
        created_at: tag.time(tag.created_at),
        updated_at: tag.time(tag.updated_at),            
    };
};


// tagSchema.methods.posts = tag=>{

//          Post.findById(tag.post_id).exec((err,post)=>{
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



// make this available to our users in our Node applications
module.exports = mongoose.model('PostTag', tagSchema);