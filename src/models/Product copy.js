//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),
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
var siteSchema = new Schema({
        user_id: { type: String},
        author: { type: Schema.Types.ObjectId, ref: 'User' },     //谁发的文章
      //  bests: [{ type: Schema.Types.ObjectId, ref: 'Best' }],    //用来导航当个网站介绍里，最后的联系best文章
        name: { type: String, required: true,unique:true}, //必须和best里的site name保持一致
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SiteCategory',
            // required: true // Uncomment if you want to enforce at least one category
        }],
        subcategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SiteSubcategory',
            // required: true // Uncomment if you want to enforce at least one subcategory
        }],
        stageCategories: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'SiteStageCategory',
          // required: true // Uncomment if you want to enforce at least one category
        }],
        stageSubcategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SiteStageSubcategory',
            // required: true // Uncomment if you want to enforce at least one subcategory
        }],
         tags: [{ type: Schema.Types.ObjectId, ref: 'Tag' }],//[String]//供提交页面调用 每个具体的网站
         tagsString: { type: String},
         availability: { type: String, required: true},
          // upvoteCount: {type: Number, default: 0},
          // upvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          // downvoteCount: {type: Number, default: 0},
          // downvoteUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
          // bookmarkCount: {type: Number, default: 0},
          // bookmarkUser: [{ type: Schema.Types.ObjectId, ref: 'User' }],
         // colletCount: {type: Number, default: 0},
          imgs: [{ type: String}],
        //  newFeatures: [String],
          name_changed:  { type: String, required: true,unique:true},
          startingPrice:   {type: Number},
          pricing: [String],
          pricingModel: { type: String, required: true }, // e.g., 'subscription', 'one-time purchase'
          releaseDate: { type: Date }, // Release date of the gadget
          brand: { type: String }, // Brand or manufacturer    
          brief: { type: String},
          intro: { type: String},
          logo: { type: String},    
          pv: {type: Number, default: 0},
          hidden: {type: Boolean, default: false},
          great:{type: Boolean, default: false},

                // Product Identification
          modelNumber: { type: String, required: true }, // 型号
          registrationNumber: { type: String, required: true }, // 注册证号
          standardNumber: { type: String }, // 执行标准号
          
          // Manufacturing Info
          manufacturer: { type: String, required: true }, // 生产企业
          manufacturingLocation: { type: String }, // 生产地点
          qualityCertifications: [String], // 质量认证
          
          // Technical Specifications
          technicalParameters: { type: Schema.Types.Mixed }, // 技术参数
          powerConsumption: { type: String }, // 功率
          dimensions: { type: String }, // 尺寸
          weight: { type: Number }, // 重量(kg)
          color: { type: String }, // 颜色
          
          // Usage & Application
          usageEnvironment: { type: String }, // 使用场地
          targetUsers: [String], // 使用人群
          therapyMethods: [String], // 理疗方式分类
          treatmentDuration: { type: String }, // 治疗时长
          
          // Medical & Health
          therapeuticEffects: [String], // 保健理疗效果
          applicableDiseases: [String], // 适合疾病
          symptoms: [String], // 适合症状
          contraindications: [String], // 禁忌症
          
          // Service & Support
          warranty: { type: String }, // 保修信息
          valueAddedServices: [String], // 增值服务
          technicalSupport: { type: String }, // 技术支持
          trainingProvided: { type: Boolean, default: false }, // 是否提供培训
          
          // Compliance & Safety
          safetyStandards: [String], // 安全标准
          regulatoryCompliance: [String], // 法规合规
          certifications: [String], // 认证证书
          seoTitle:  { type: String, required: true },
          seoKeyword:  { type: String},
          seoDescription:  { type: String, required: true }
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

siteSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};


siteSchema.methods.processProduct = site=>{
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
          //  SiteSubcategory.findOne({_id: id}, function(err, res){
          //     siteSubcategoriess.push(res);
          //  });
     // }
     // console.log(`res ${JSON.stringify(siteSubcategoriess)}`)

    return {
        _id:site._id,
        site: true,//??
        isSite: true,
       // subcategoriesValues:siteSubcategoriess,
        user_id: site.user_id,
        author: site.author,
        name: site.name,
        url: site.url,
        tags: site.tags,
        pricing: site.pricing,
        pricingModel: site.pricingModel,
        releaseDate:  moment(site.releaseDate).format('ddd, MMM DD, YYYY'),
        brand: site.brand,
        //producthuntUrl: site.producthuntUrl,
        tagsString: site.tagsString,//only for bulk import
        tagsArray,
        availability: site.availability,
        categories: site.categories,
        subcategories: site.subcategories,
       // favCount: site.favCount,
        // upvoteCount: site.upvoteCount, 
        // upvoteUser: site.upvoteUser,
        // downvoteCount: site.downvoteCount, 
        // downvoteUser: site.downvoteUser,
        // bookmarkUser: site.bookmarkUser,
        // bookmarkCount: site.bookmarkCount,
        imgs: site.imgs,
        name_changed: site.name_changed,
        startingPrice: site.startingPrice,
        brief: site.brief,
        intro: site.intro,
        briefNoTag,
        logo: site.logo,
        seoTitle: site.seoTitle,
        seoKeyword: site.seoKeyword,
        seoDescription: site.seoDescription,
        pv: site.pv,
        like: site.like,
        hidden: site.hidden,
        modelNumber: site.modelNumber,
        registrationNumber: site.registrationNumber,
        standardNumber: site.standardNumber,
        manufacturer: site.manufacturer,
        manufacturingLocation: site.manufacturingLocation,
        qualityCertifications: site.qualityCertifications,
        technicalParameters: site.technicalParameters,
        powerConsumption: site.powerConsumption,
        dimensions: site.dimensions,
        weight: site.weight,
        color: site.color,
        usageEnvironment: site.usageEnvironment,
        targetUsers: site.targetUsers,
        therapyMethods: site.therapyMethods,
        treatmentDuration: site.treatmentDuration,
        therapeuticEffects: site.therapeuticEffects,
        applicableDiseases: site.applicableDiseases,
        symptoms: site.symptoms,
        contraindications: site.contraindications,
        warranty: site.warranty,
        valueAddedServices: site.valueAddedServices,
        technicalSupport: site.technicalSupport,
        trainingProvided: site.trainingProvided,
        safetyStandards: site.safetyStandards,
        regulatoryCompliance: site.regulatoryCompliance,
        certifications: site.certifications,
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


siteSchema.methods.user = (user_id,fn)=>{
          
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

siteSchema.methods.comments = (site_id,fn)=>{
Comment.find({'site_id':site_id},function(err,comments){
   comments =  comments.map(function(comment){
       return comment.processComment(comment);
   });
   fn(comments);
});
};







// make this available to our users in our Node applications
module.exports = mongoose.model('Site', siteSchema);