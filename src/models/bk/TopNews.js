//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),

     Category = require('../models/TopNewsCategory'),
     TopNews = require('../models/TopNews'),
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
var newsSchema = new Schema({
          user_id: { type: String},
          author: { type: Schema.Types.ObjectId, ref: 'User' },     //谁发的文章
        //  bests: [{ type: Schema.Types.ObjectId, ref: 'Best' }],    //用来导航当个网站介绍里，最后的联系best文章
          title: { type: String, required: true,unique:true}, //必须和best里的site name保持一致
          hero: { type: String, required: true}, 
          category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            //required: true
          },
          summary: { type: String},
          // subcategory: {
          //   type: mongoose.Schema.Types.ObjectId,
          //   ref: 'Subcategory',
          //   //required: true
          // },
        tertiaryPath: { type: String, required: true}, 
        topArticle1: { type: String},  
        topArticle2: { type: String}, 
        prompt1: { type: String},
        prompt2: { type: String},
        open1: { type: String},
        open2: { type: String},
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
        outTop1_content: { type: String},//common
        outTop2_content: { type: String},
        outTop3_content: { type: String},

        frequency: { type: String},//news type: weekly or monthly?
        top1_title: { type: String},//news title
        top2_title: { type: String},
        top3_title: { type: String},
        top4_title: { type: String},
        top5_title: { type: String},
        top6_title: { type: String},
        top7_title: { type: String},
        top8_title: { type: String},
        top9_title: { type: String},
        top10_title: { type: String},
        outTop1_title: { type: String},
        outTop2_title: { type: String},
        outTop3_title: { type: String},      

        top1_further_link: { type: String},
        top2_further_link: { type: String},
        top3_further_link: { type: String},
        top4_further_link: { type: String},
        top5_further_link: { type: String},
        top6_further_link: { type: String},
        top7_further_link: { type: String},
        top8_further_link: { type: String},
        top9_further_link: { type: String},
        top10_further_link: { type: String},
        outTop1_further_link: { type: String},
        outTop2_further_link: { type: String},
        outTop3_further_link: { type: String},

        top1_youtube:  { type: String},
        top2_youtube:  { type: String},
        top3_youtube:  { type: String},
        top4_youtube:  { type: String},
        top5_youtube:  { type: String},
        top6_youtube:  { type: String},
        top7_youtube:  { type: String},
        top8_youtube:  { type: String},
        top9_youtube:  { type: String},
        top10_youtube:  { type: String},
        outTop1_youtube:  { type: String},
        outTop2_youtube:  { type: String},
        outTop3_youtube:  { type: String},
        issueNum: {type: Number, default: 0},
        upvoteCount: {type: Number, default: 0},
        upvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
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
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

newsSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};


newsSchema.methods.processTop = site=>{

    // let briefNoTag;
    // if(site.brief){
    //     briefNoTag = site.brief.replace(/(<([^>]+)>)/gi, '');
    // }

    const tops = [];
    for (let i = 1; i <= 10; i++) {
      if(site[`top${i}_title`]){ //prevent fill empty value
        tops[i - 1] = {
          id: i,
          content: site[`top${i}_content`],
          content_NoTag: site[`top${i}_content`] ? util.removeHTMLTags(site[`top${i}_content`]) : '',
          title: site[`top${i}_title`],
          further_link: site[`top${i}_further_link`],
          youtube: site[`top${i}_youtube`],
        };
      }
    }
    
    return {
      _id: site._id,
      user_id: site.user_id,
      isTopNews:true,
      author: site.author,
      title: site.title,
      summary: site.summary,
      topArticle1: site.topArticle1,
      topArticle2: site.topArticle2,
      prompt1: site.prompt1,
      prompt2: site.prompt2,
      open1: site.open1,
      open2: site.open2,
      hero: site.hero,
      tertiaryPath:site.tertiaryPath,
      category: site.category,
      topsArray: tops,
  //    subcategory: site.siteSubcategory,
      top1_content: site.top1_content,
      top2_content: site.top2_content,
      top3_content: site.top3_content,
      top4_content: site.top4_content,
      top5_content: site.top5_content,
      top6_content: site.top6_content,
      top7_content: site.top7_content,
      top8_content: site.top8_content,
      top9_content: site.top9_content,
      top10_content: site.top10_content,
      frequency: site.frequency,
      top1_title: site.top1_title,
      top2_title: site.top2_title,
      top3_title: site.top3_title,
      top4_title: site.top4_title,
      top5_title: site.top5_title,
      top6_title: site.top6_title,
      top7_title: site.top7_title,
      top8_title: site.top8_title,
      top9_title: site.top9_title,
      top10_title: site.top10_title,
      top1_further_link: site.top1_further_link,
      top2_further_link: site.top2_further_link,
      top3_further_link: site.top3_further_link,
      top4_further_link: site.top4_further_link,
      top5_further_link: site.top5_further_link,
      top6_further_link: site.top6_further_link,
      top7_further_link: site.top7_further_link,
      top8_further_link: site.top8_further_link,
      top9_further_link: site.top9_further_link,
      top10_further_link: site.top10_further_link,
      top1_youtube: site.top1_youtube,
      top2_youtube: site.top2_youtube,
      top3_youtube: site.top3_youtube,
      top4_youtube: site.top4_youtube,
      top5_youtube: site.top5_youtube,
      top6_youtube: site.top6_youtube,
      top7_youtube: site.top7_youtube,
      top8_youtube: site.top8_youtube,
      top9_youtube: site.top9_youtube,
      top10_youtube: site.top10_youtube,

      outTop1_further_link: site.outTop1_further_link,
      outTop2_further_link: site.outTop2_further_link,
      outTop3_further_link: site.outTop3_further_link,
      outTop1_title: site.outTop1_title,
      outTop2_title: site.outTop2_title,
      outTop3_title: site.outTop3_title,     
      outTop1_youtube: site.outTop1_youtube,
      outTop2_youtube:  site.outTop2_youtube,
      outTop3_youtube:  site.outTop3_youtube, 
      outTop1_content:site.outTop1_content,
      outTop2_content: site.outTop2_content,
      outTop3_content: site.outTop3_content,

      issueNum: site.issueNum,
      upvoteCount: site.upvoteCount,
      upvoteUser: site.upvoteUser,
      imgs: site.imgs,
      title_changed: site.title_changed,
      verified: site.verified,
      top: site.top,
      pv: site.pv,
      hidden: site.hidden,
      great: site.great,
      seoTitle: site.seoTitle,
      seoKeyword: site.seoKeyword,
      seoDescription: site.seoDescription,
      created_at: site.time(site.created_at),
      updated_at: site.time(site.updated_at),            
    };
};


// newsSchema.methods.posts = site=>{

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


newsSchema.methods.user = (user_id,fn)=>{
          
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

newsSchema.methods.comments = (site_id,fn)=>{
Comment.find({'site_id':site_id},function(err,comments){
   comments =  comments.map(function(comment){
       return comment.processComment(comment);
   });
   fn(comments);
});
};







// make this available to our users in our Node applications
module.exports = mongoose.model('TopNews', newsSchema);