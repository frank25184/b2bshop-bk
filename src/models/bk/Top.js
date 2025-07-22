//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),

     Category = require('../models/TopCategory'),
     Subcategory = require('../models/TopSubcategory'),
     NewsCategory = require('../models/TopNewsCategory'),
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
var topSchema = new Schema({
        user_id: { type: String},
        author: { type: Schema.Types.ObjectId, ref: 'User' },     //谁发的文章
        title: { type: String, required: true,unique:true}, //必须和best里的site name保持一致
        hero: { type: String, required: true}, 
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
        subcategory: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Subcategory',
        },
        categoryName: { type: String, required: true}, 
        subcategoryName: { type: String}, 

        summary: { type: String}, 
        module_type:  { type: String, required: true}, 
        tertiaryPath:  { type: String},  

        top1_id:  { type: String},//common
        top2_id:  { type: String},
        top3_id:  { type: String},
        top4_id:  { type: String},
        top5_id:  { type: String},
        top6_id:  { type: String},
        top7_id:  { type: String},
        top8_id:  { type: String},
        top9_id:  { type: String},
        top10_id:  { type: String},

        top1_content: { type: String},//common
        top2_content: { type: String},
        top3_content: { type: String},
        top4_content: { type: String},
        top5_content: { type: String},
        top6_content: { type: String},
        top7_content: { type: String},
        top8_content: { type: String},
        top9_content: { type: String},
        top10_content: { type: String},

        qa_title1: String,
        qa_content1: String,
        qa_title1_h3_1: String,
        qa_content1_h3_1: String,
        qa_title1_h3_2: String,
        qa_content1_h3_2: String,
        qa_title1_h3_3: String,
        qa_content1_h3_3: String,
        qa_title1_h3_4: String,
        qa_content1_h3_4: String,
        qa_title1_h3_5: String,
        qa_content1_h3_5: String,
        qa_title2: String,
        qa_content2: String,
        qa_title2_h3_1: String,
        qa_content2_h3_1: String,
        qa_title2_h3_2: String,
        qa_content2_h3_2: String,
        qa_title2_h3_3: String,
        qa_content2_h3_3: String,
        qa_title2_h3_4: String,
        qa_content2_h3_4: String,
        qa_title2_h3_5: String,
        qa_content2_h3_5: String,
        qa_title3: String,
        qa_content3: String,
        qa_title3_h3_1: String,
        qa_content3_h3_1: String,
        qa_title3_h3_2: String,
        qa_content3_h3_2: String,
        qa_title3_h3_3: String,
        qa_content3_h3_3: String,
        qa_title3_h3_4: String,
        qa_content3_h3_4: String,
        qa_title3_h3_5: String,
        qa_content3_h3_5: String,
        qa_title4: String,
        qa_content4: String,
        qa_title4_h3_1: String,
        qa_content4_h3_1: String,
        qa_title4_h3_2: String,
        qa_content4_h3_2: String,
        qa_title4_h3_3: String,
        qa_content4_h3_3: String,
        qa_title4_h3_4: String,
        qa_content4_h3_4: String,
        qa_title4_h3_5: String,
        qa_content4_h3_5: String,
        qa_title5: String,
        qa_content5: String,
        qa_title5_h3_1: String,
        qa_content5_h3_1: String,
        qa_title5_h3_2: String,
        qa_content5_h3_2: String,
        qa_title5_h3_3: String,
        qa_content5_h3_3: String,
        qa_title5_h3_4: String,
        qa_content5_h3_4: String,
        qa_title5_h3_5: String,
        qa_content5_h3_5: String,
        qa_title6: String,
        qa_content6: String,
        qa_title6_h3_1: String,
        qa_content6_h3_1: String,
        qa_title6_h3_2: String,
        qa_content6_h3_2: String,
        qa_title6_h3_3: String,
        qa_content6_h3_3: String,
        qa_title6_h3_4: String,
        qa_content6_h3_4: String,
        qa_title6_h3_5: String,
        qa_content6_h3_5: String,
        qa_title7: String,
        qa_content7: String,
        qa_title7_h3_1: String,
        qa_content7_h3_1: String,
        qa_title7_h3_2: String,
        qa_content7_h3_2: String,
        qa_title7_h3_3: String,
        qa_content7_h3_3: String,
        qa_title7_h3_4: String,
        qa_content7_h3_4: String,
        qa_title7_h3_5: String,
        qa_content7_h3_5: String,
        qa_title8: String,
        qa_content8: String,
        qa_title8_h3_1: String,
        qa_content8_h3_1: String,
        qa_title8_h3_2: String,
        qa_content8_h3_2: String,
        qa_title8_h3_3: String,
        qa_content8_h3_3: String,
        qa_title8_h3_4: String,
        qa_content8_h3_4: String,
        qa_title8_h3_5: String,
        qa_content8_h3_5: String,
        qa_title9: String,
        qa_content9: String,
        qa_title9_h3_1: String,
        qa_content9_h3_1: String,
        qa_title9_h3_2: String,
        qa_content9_h3_2: String,
        qa_title9_h3_3: String,
        qa_content9_h3_3: String,
        qa_title9_h3_4: String,
        qa_content9_h3_4: String,
        qa_title9_h3_5: String,
        qa_content9_h3_5: String,
        qa_title10: String,
        qa_content10: String,
        qa_title10_h3_1: String,
        qa_content10_h3_1: String,
        qa_title10_h3_2: String,
        qa_content10_h3_2: String,
        qa_title10_h3_3: String,
        qa_content10_h3_3: String,
        qa_title10_h3_4: String,
        qa_content10_h3_4: String,
        qa_title10_h3_5: String,
        qa_content10_h3_5: String,

        upvoteCount: {type: Number, default: 0},
        upvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        downvoteCount: {type: Number, default: 0},
        downvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        bookmarkCount: {type: Number, default: 0},
        bookmarkUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        // colletCount: {type: Number, default: 0},
        imgs: [{ type: String}],
        title_changed:  { type: String, required: true,unique:true},
        verified:  { type: Boolean}, 
        top:  { type: Boolean},
        pv: {type: Number, default: 0},
        hidden: {type: Boolean, default: false},
        great:{type: Boolean, default: false},
        seoTitle:  { type: String, required: true },
        seoKeyword:  { type: String},
        seoDescription:  { type: String, required: true },
        sendMail:  {type: Boolean, default: false}
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

topSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};


topSchema.methods.processTop = top=>{

    // let briefNoTag;
    // if(top.brief){
    //     briefNoTag = top.brief.replace(/(<([^>]+)>)/gi, '');
    // }
    let module_type = top.module_type;
    let isSite = false,isGadget=false,isNews=false;
    if(module_type == 'sites'){
       isSite = true;
    }else if(module_type == 'gadgets'){
      isGadget=true;
    }else if(module_type == 'news'){
      isNews=true;
    }
    return {
      _id: top._id,
      isTop:true,
      isSite, isGadget,isNews,
      user_id: top.user_id,
      author: top.author,
      title: top.title,
      hero: top.hero,
      category: top.category,
      subcategory: top.subcategory,
      categoryName: top.categoryName,
      subcategoryName: top.subcategoryName,
      summary: top.summary,
      module_type: top.module_type,
      tertiaryPath: top.tertiaryPath,
      top1_id: top.top1_id,
      top2_id: top.top2_id,
      top3_id: top.top3_id,
      top4_id: top.top4_id,
      top5_id: top.top5_id,
      top6_id: top.top6_id,
      top7_id: top.top7_id,
      top8_id: top.top8_id,
      top9_id: top.top9_id,
      top10_id: top.top10_id,
      top1_content: top.top1_content,
      top2_content: top.top2_content,
      top3_content: top.top3_content,
      top4_content: top.top4_content,
      top5_content: top.top5_content,
      top6_content: top.top6_content,
      top7_content: top.top7_content,
      top8_content: top.top8_content,
      top9_content: top.top9_content,
      top10_content: top.top10_content,
      qa_title1: top.qa_title1,
      qa_title2: top.qa_title2,
      qa_title3: top.qa_title3,
      qa_title4: top.qa_title4,
      qa_title5: top.qa_title5,
      qa_title6: top.qa_title6,
      qa_title7: top.qa_title7,
      qa_title8: top.qa_title8,
      qa_title9: top.qa_title9,
      qa_title10: top.qa_title10,
      qa_content1: top.qa_content1,
      qa_content2: top.qa_content2,
      qa_content3: top.qa_content3,
      qa_content4: top.qa_content4,
      qa_content5: top.qa_content5,
      qa_content6: top.qa_content6,
      qa_content7: top.qa_content7,
      qa_content8: top.qa_content8,
      qa_content9: top.qa_content9,
      qa_content10: top.qa_content10,

      qa_title1_h3_1: top.qa_title1_h3_1,
      qa_content1_h3_1: top.qa_content1_h3_1,
      qa_title1_h3_2: top.qa_title1_h3_2,
      qa_content1_h3_2: top.qa_content1_h3_2,
      qa_title1_h3_3: top.qa_title1_h3_3,
      qa_content1_h3_3: top.qa_content1_h3_3,
      qa_title1_h3_4: top.qa_title1_h3_4,
      qa_content1_h3_4: top.qa_content1_h3_4,
      qa_title1_h3_5: top.qa_title1_h3_5,
      qa_content1_h3_5: top.qa_content1_h3_5,
   
      qa_title2_h3_1: top.qa_title2_h3_1,
      qa_content2_h3_1: top.qa_content2_h3_1,
      qa_title2_h3_2: top.qa_title2_h3_2,
      qa_content2_h3_2: top.qa_content2_h3_2,
      qa_title2_h3_3: top.qa_title2_h3_3,
      qa_content2_h3_3: top.qa_content2_h3_3,
      qa_title2_h3_4: top.qa_title2_h3_4,
      qa_content2_h3_4: top.qa_content2_h3_4,
      qa_title2_h3_5: top.qa_title2_h3_5,
      qa_content2_h3_5: top.qa_content2_h3_5,
      
      qa_title3_h3_1: top.qa_title3_h3_1,
      qa_content3_h3_1: top.qa_content3_h3_1,
      qa_title3_h3_2: top.qa_title3_h3_2,
      qa_content3_h3_2: top.qa_content3_h3_2,
      qa_title3_h3_3: top.qa_title3_h3_3,
      qa_content3_h3_3: top.qa_content3_h3_3,
      qa_title3_h3_4: top.qa_title3_h3_4,
      qa_content3_h3_4: top.qa_content3_h3_4,
      qa_title3_h3_5: top.qa_title3_h3_5,
      qa_content3_h3_5: top.qa_content3_h3_5,
      
      qa_title4_h3_1: top.qa_title4_h3_1,
      qa_content4_h3_1: top.qa_content4_h3_1,
      qa_title4_h3_2: top.qa_title4_h3_2,
      qa_content4_h3_2: top.qa_content4_h3_2,
      qa_title4_h3_3: top.qa_title4_h3_3,
      qa_content4_h3_3: top.qa_content4_h3_3,
      qa_title4_h3_4: top.qa_title4_h3_4,
      qa_content4_h3_4: top.qa_content4_h3_4,
      qa_title4_h3_5: top.qa_title4_h3_5,
      qa_content4_h3_5: top.qa_content4_h3_5,
      
      qa_title5_h3_1: top.qa_title5_h3_1,
      qa_content5_h3_1: top.qa_content5_h3_1,
      qa_title5_h3_2: top.qa_title5_h3_2,
      qa_content5_h3_2: top.qa_content5_h3_2,
      qa_title5_h3_3: top.qa_title5_h3_3,
      qa_content5_h3_3: top.qa_content5_h3_3,
      qa_title5_h3_4: top.qa_title5_h3_4,
      qa_content5_h3_4: top.qa_content5_h3_4,
      qa_title5_h3_5: top.qa_title5_h3_5,
      qa_content5_h3_5: top.qa_content5_h3_5,
      
      qa_title6_h3_1: top.qa_title6_h3_1,
      qa_content6_h3_1: top.qa_content6_h3_1,
      qa_title6_h3_2: top.qa_title6_h3_2,
      qa_content6_h3_2: top.qa_content6_h3_2,
      qa_title6_h3_3: top.qa_title6_h3_3,
      qa_content6_h3_3: top.qa_content6_h3_3,
      qa_title6_h3_4: top.qa_title6_h3_4,
      qa_content6_h3_4: top.qa_content6_h3_4,
      qa_title6_h3_5: top.qa_title6_h3_5,
      qa_content6_h3_5: top.qa_content6_h3_5,
     
      qa_title7_h3_1: top.qa_title7_h3_1,
      qa_content7_h3_1: top.qa_content7_h3_1,
      qa_title7_h3_2: top.qa_title7_h3_2,
      qa_content7_h3_2: top.qa_content7_h3_2,
      qa_title7_h3_3: top.qa_title7_h3_3,
      qa_content7_h3_3: top.qa_content7_h3_3,
      qa_title7_h3_4: top.qa_title7_h3_4,
      qa_content7_h3_4: top.qa_content7_h3_4,
      qa_title7_h3_5: top.qa_title7_h3_5,
      qa_content7_h3_5: top.qa_content7_h3_5,
     
      qa_title8_h3_1: top.qa_title8_h3_1,
      qa_content8_h3_1: top.qa_content8_h3_1,
      qa_title8_h3_2: top.qa_title8_h3_2,
      qa_content8_h3_2: top.qa_content8_h3_2,
      qa_title8_h3_3: top.qa_title8_h3_3,
      qa_content8_h3_3: top.qa_content8_h3_3,
      qa_title8_h3_4: top.qa_title8_h3_4,
      qa_content8_h3_4: top.qa_content8_h3_4,
      qa_title8_h3_5: top.qa_title8_h3_5,
      qa_content8_h3_5: top.qa_content8_h3_5,
      
      qa_title9_h3_1: top.qa_title9_h3_1,
      qa_content9_h3_1: top.qa_content9_h3_1,
      qa_title9_h3_2: top.qa_title9_h3_2,
      qa_content9_h3_2: top.qa_content9_h3_2,
      qa_title9_h3_3: top.qa_title9_h3_3,
      qa_content9_h3_3: top.qa_content9_h3_3,
      qa_title9_h3_4: top.qa_title9_h3_4,
      qa_content9_h3_4: top.qa_content9_h3_4,
      qa_title9_h3_5: top.qa_title9_h3_5,
      qa_content9_h3_5: top.qa_content9_h3_5,
     
      qa_title10_h3_1: top.qa_title10_h3_1,
      qa_content10_h3_1: top.qa_content10_h3_1,
      qa_title10_h3_2: top.qa_title10_h3_2,
      qa_content10_h3_2: top.qa_content10_h3_2,
      qa_title10_h3_3: top.qa_title10_h3_3,
      qa_content10_h3_3: top.qa_content10_h3_3,
      qa_title10_h3_4: top.qa_title10_h3_4,
      qa_content10_h3_4: top.qa_content10_h3_4,
      qa_title10_h3_5: top.qa_title10_h3_5,
      qa_content10_h3_5: top.qa_content10_h3_5,
      upvoteCount: top.upvoteCount,
      upvoteUser: top.upvoteUser,
      downvoteCount: top.downvoteCount,
      downvoteUser: top.downvoteUser,
      bookmarkCount: top.bookmarkCount,
      bookmarkUser: top.bookmarkUser,
     // colletCount: top.colletCount,
      imgs: top.imgs,
      title_changed: top.title_changed,
      verified: top.verified,
      top: top.top,
      pv: top.pv,
      hidden: top.hidden,
      great: top.great,
      seoTitle: top.seoTitle,
      seoKeyword: top.seoKeyword,
      seoDescription: top.seoDescription,
      sendMail: top.sendMail,
      created_at: top.time(top.created_at),
      updated_at: top.time(top.updated_at),            
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


topSchema.methods.user = (user_id,fn)=>{
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

topSchema.methods.comments = (site_id,fn)=>{
Comment.find({'site_id':site_id},function(err,comments){
   comments =  comments.map(function(comment){
       return comment.processComment(comment);
   });
   fn(comments);
});
};







// make this available to our users in our Node applications
module.exports = mongoose.model('Top', topSchema);