//./models/Tag.js
"use strict";

const { default: isBoolean } = require('validator/lib/isBoolean');

const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
    //   User = require('./User'),
    //   Best = require('./Best'),
    //  Product = require('./Product'),
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
var subcategorySchema = new Schema({
          //user_id: { type: String, required: true },
          //user_id: { type: String, required: true },
        //  posts: [{ type: Schema.Types.ObjectId, ref: 'Site'}],   
         // bests: [{ type: Schema.Types.ObjectId, ref: 'Best' }],   
           name: {
            type: String,
            required: true,
            unique: true, // 确保子类别名称唯一
            index: true // 为 name 字段添加索引
          },
         // bestCount: { type: Number, default: 0},
          count:  { type: Number, default: 0},
          intro:  { type: String},
          aiGenerated: { type: Boolean, default: false}
   
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

subcategorySchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};

subcategorySchema.methods.processSubcategory = ca=>{
    let intro = ca.intro;
    if(intro){
        intro = ca.intro.replace(/(<([^>]+)>)/gi, '');
    }
    let name_changed = util.urlBeautify(ca.name);

    return {
        _id:ca._id,
        name: ca.name,
        name_changed,
        count: ca.count,
        intro,
        aiGenerated: ca.aiGenerated,
        created_at: ca.time(ca.created_at),
        updated_at: ca.time(ca.updated_at),            
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
module.exports = mongoose.model('PostSubcategory', subcategorySchema);