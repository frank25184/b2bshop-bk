//./models/Tag.js
"use strict";

const { default: isBoolean } = require('validator/lib/isBoolean');

const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
    //   User = require('./User'),
    //   Best = require('./Best'),
      Product = require('./Product'),
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
var proTagSchema = new Schema({
          //user_id: { type: String, required: true },
          //user_id: { type: String, required: true },
          products: [{ type: Schema.Types.ObjectId, ref: 'Product'}],   
         // bests: [{ type: Schema.Types.ObjectId, ref: 'Best' }],   
          name: { type: String},
         // bestCount: { type: Number, default: 0},
          count:  { type: Number, default: 0},
          intro:  { type: String},
          aiGenerated: { type: Boolean, default: false}
   
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

proTagSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};

proTagSchema.methods.processTag = tag=>{
    let brief;
    if(tag.intro){
        brief = tag.intro.replace(/(<([^>]+)>)/gi, '');
    }
    
    return {
        _id:tag._id,
      
        products: tag.products,
        name: tag.name,
       // bestCount: tag.bestCount,
        count: tag.count,
        intro: tag.intro,
        aiGenerated: tag.aiGenerated,

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
module.exports = mongoose.model('ProTag', proTagSchema);