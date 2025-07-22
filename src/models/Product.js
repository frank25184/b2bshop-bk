//./models/Tag.js
"use strict";
const mongoose = require('mongoose'),
      Schema = mongoose.Schema,
      User = require('./User'),
     util = require('../libs/utility'),
     ProductCategory = require('../models/Category'),
     ProductSubcategory = require('../models/Subcategory'),
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
            ref: 'ProductCategory',
            // required: true // Uncomment if you want to enforce at least one category
        }],
        subcategories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductSubcategory',
            // required: true // Uncomment if you want to enforce at least one subcategory
        }],
         tagsString: { type: String},
        //  availability: { type: String},
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
          pricing: [{
            // dimensions:  {
            //   length: Number,     // 长（厘米）
            //   width: Number,      // 宽（厘米） 
            //   height: Number      // 高（厘米）
            // },    // 尺寸/规格
            price: Number,          // 价格
            stock: Number,          // 库存
            sku: String,             // SKU编码
            weight: Number, // 重量(kg)
            color: String
          }],
          priceRange: {
              min: Number, 
              max: Number, 
              hasVariants: Boolean
          },
          brand: { type: String }, // Brand or manufacturer    
          content: { type: String},
          intro: { type: String},
          logo: { type: String},    
          pv: {type: Number, default: 0},
          hidden: {type: Boolean, default: false},
          great:{type: Boolean, default: false},

        //   registrationNumber: { type: String, required: true }, // 注册证号
        //   standardNumber: { type: String }, // 执行标准号
        //   modelNumber: String,         // 型号
        // Manufacturing Info
          manufacturer: { type: String, required: true }, // 生产企业
        //   manufacturingLocation: { type: String }, // 生产地点
        //   qualityCertifications: [String], // 质量认证
          
          // Technical Specifications
        //   technicalParameters: { type: Schema.Types.Mixed }, // 技术参数
        //   powerConsumption: { type: String }, // 功率
          
          // Usage & Application
        //   usageEnvironment: { type: String }, // 使用场地
        //   targetUsers: [String], // 使用人群
        //   therapyMethods: [String], // 理疗方式分类
        //   treatmentDuration: { type: String }, // 治疗时长
          
          // Medical & Health
        //   therapeuticEffects: [String], // 保健理疗效果
        //   applicableDiseases: [String], // 适合疾病
        //   symptoms: [String], // 适合症状
        //   contraindications: [String], // 禁忌症
          
          // Service & Support
        //   warranty: { type: String }, // 保修信息
        //   valueAddedServices: [String], // 增值服务
        //   technicalSupport: { type: String }, // 技术支持
        //   trainingProvided: { type: Boolean, default: false }, // 是否提供培训
          
          // Compliance & Safety
        //   safetyStandards: [String], // 安全标准
        //   regulatoryCompliance: [String], // 法规合规
        //   certifications: [String], // 认证证书
          seoTitle:  { type: String, required: true },
          seoKeyword:  { type: String},
          seoDescription:  { type: String, required: true },
          pathName: { type: String, required: true },
}, {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}});

siteSchema.methods.time = time=> {
    return moment(time).format('MMMM D, YYYY');
};


siteSchema.methods.processProduct = site=>{
    let briefNoTag;
    if(site.content){
        briefNoTag = site.content.replace(/(<([^>]+)>)/gi, '');
    }
    const processedPricing = (site.pricing || []).map(item => ({
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      sku: String(item.sku || ''),
      weight: Number(item.weight) || 0,
      color: String(item.color || '')
  }));
    return {
        _id:site._id,
        site: true,//??
        isSite: true,
       // subcategoriesValues:siteSubcategoriess,
        user_id: site.user_id,
        author: site.author,
        name: site.name,
        url: site.url,
        pricing: processedPricing,
        priceRange: site.priceRange,
        brand: site.brand,
        //producthuntUrl: site.producthuntUrl,
        // availability: site.availability,
        categories: site.categories,
        subcategories: site.subcategories,
        imgs: site.imgs,
        name_changed: site.name_changed,
        startingPrice: site.startingPrice,
        content: site.content,
        intro: site.intro,
        briefNoTag,
        logo: site.logo,
        seoTitle: site.seoTitle,
        seoKeyword: site.seoKeyword,
        seoDescription: site.seoDescription,
        pathName: site.pathName,
        pv: site.pv,
        like: site.like,
        hidden: site.hidden,
        // modelNumber: site.modelNumber,
        // registrationNumber: site.registrationNumber,
        // standardNumber: site.standardNumber,
        manufacturer: site.manufacturer,
        // manufacturingLocation: site.manufacturingLocation,
        // qualityCertifications: site.qualityCertifications,
        // technicalParameters: site.technicalParameters,
        // powerConsumption: site.powerConsumption,
        // color: site.color,
        // usageEnvironment: site.usageEnvironment,
        // targetUsers: site.targetUsers,
        // therapyMethods: site.therapyMethods,
        // treatmentDuration: site.treatmentDuration,
        // therapeuticEffects: site.therapeuticEffects,
        // applicableDiseases: site.applicableDiseases,
        // symptoms: site.symptoms,
        // contraindications: site.contraindications,
        // warranty: site.warranty,
        // valueAddedServices: site.valueAddedServices,
        // technicalSupport: site.technicalSupport,
        // trainingProvided: site.trainingProvided,
        // safetyStandards: site.safetyStandards,
        // regulatoryCompliance: site.regulatoryCompliance,
        // certifications: site.certifications,
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
module.exports = mongoose.model('Product', siteSchema);