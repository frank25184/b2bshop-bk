"use strict";
const  User = require('../models/User'),
      logger = require('../libs/logger'),
      Product = require('../models/Product'),
      Top = require('../models/Top'),
      Category = require('../models/TopCategory'),
      Subcategory = require('../models/TopSubcategory'), 
      TopNewsCategory = require('../models/TopNewsCategory'),
      TopSubcategory = require('../models/TopSubcategory'),
      TopNews = require('../models/TopNews'),
      OpenSource = require('../models/OpenSource'),
      Prompt = require('../models/Prompt'),
      Open = require('../models/OpenSource'),
      Site = require('../models/Site'),
      Gadget = require('../models/Product'),
      NewsletterMail = require('../models/Email'),
      config  = require('../common/get-config'),
      { IncomingForm }  = require('formidable'),
      mailService  = require('../libs/mail')(config),
      topProxy = require('../db_proxy/top'), 
      siteProxy = require('../db_proxy/site'), 
      gadgetProxy =  require('../db_proxy/product'), 
      topNewsProxy =   require('../db_proxy/topNews'), 
      xss = require('xss'),
      util = require('../libs/utility');
      const mongoose = require('mongoose');
      const { ObjectId } = mongoose.Types;

const seo = require('../config/seo');
const { normalizeNodeOptions } = require('ioredis/built/cluster/util');
// const Category = require('../models/Category');
module.exports = {
    postSiteForMultiIMG: async (req,res)=>{
        const user = req.user;
        let top = new Top();
        // Productimage
        let uploadDir = config.uploadDir + 'tops/thumbnail/'
        util.checkDir(uploadDir);
        const form =  new IncomingForm({
            multiples: true,
            maxFileSize: 5242880*2,  /**5 * 1024 * 1024 (5mb)**/
            keepExtensions: true,
            uploadDir: uploadDir,
            allowEmptyFiles: false,
            minFileSize: 1,/* 1 byte*/
            filename: function(name, ext, part, form){
                //name = new Date().toDateString + filename
                const timestamp = new Date().getTime();  
                const seconds = Math.floor(timestamp / 1000);
                name = util.urlBeautify(name)
                return `${seconds}-${name}${ext}`;              
            },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
        });
  
        form.parse(req,async (err,fields,files)=>{
            let module_type;
            if (fields.module_type && fields.module_type.length) { module_type = util.trim(xss(fields.module_type[0])); }//which to post: site,gadget or news
            if(module_type == 'news'){
                top = new TopNews();
            }

            logger.info(`files: ${JSON.stringify(files)},fields: ${JSON.stringify(fields)}`)
            top.author = user._id;
            top.user_id = user._id;
            let images = files.topIMG;//array
            let imgs = [];
            for(let i=0;i<images.length;i++){
                let filename = images[i].newFilename.trim();
                imgs.push(filename)
            }
            top.imgs = imgs;

            //for all 
            let title, category, subcategory;
            if (fields.title && fields.title.length) { title = util.trim(xss(fields.title[0])); }
            if (fields.category && fields.category.length) { category = util.trim(xss(fields.category[0])); console.log(`category: ${category}`);}
            
            if (fields.hero.length) { top.hero = util.trim(xss(fields.hero[0])); }

            top.title = title;
            top.title_changed = util.urlBeautify(title);  
            top.module_type = module_type;
            if (fields.top1_content && fields.top1_content.length) { top.top1_content = util.trim(xss(fields.top1_content[0])); }
            if (fields.top2_content && fields.top2_content.length) { top.top2_content = util.trim(xss(fields.top2_content[0])); }
            if (fields.top3_content && fields.top3_content.length) { top.top3_content = util.trim(xss(fields.top3_content[0])); }
            if (fields.top4_content && fields.top4_content.length) { top.top4_content = util.trim(xss(fields.top4_content[0])); }
            if (fields.top5_content && fields.top5_content.length) { top.top5_content = util.trim(xss(fields.top5_content[0])); }
            if (fields.top6_content && fields.top6_content.length) { top.top6_content = util.trim(xss(fields.top6_content[0])); }
            if (fields.top7_content && fields.top7_content.length) { top.top7_content = util.trim(xss(fields.top7_content[0])); }
            if (fields.top8_content && fields.top8_content.length) { top.top8_content = util.trim(xss(fields.top8_content[0])); }
            if (fields.top9_content && fields.top9_content.length) { top.top9_content = util.trim(xss(fields.top9_content[0])); }
            if (fields.top10_content && fields.top10_content.length) { top.top10_content = util.trim(xss(fields.top10_content[0])); }
            if (fields.summary && fields.summary.length) { top.summary = util.trim(xss(fields.summary[0])); }
            if (fields.seoTitle && fields.seoTitle.length) { top.seoTitle = util.trim(xss(fields.seoTitle[0])); }
            if (fields.seoKeyword && fields.seoKeyword.length) { top.seoKeyword = util.trim(xss(fields.seoKeyword[0])); }
            if (fields.seoDescription && fields.seoDescription.length) { top.seoDescription = util.trim(xss(fields.seoDescription[0])); }
            if (fields.tertiaryPath && fields.tertiaryPath.length) { 
                top.tertiaryPath = util.urlBeautify(util.trim(xss(fields.tertiaryPath[0]))); 
            }
        
            //for gadgets or sites
            if(module_type == 'gadgets' || module_type == 'sites'){
                if (fields.category && fields.category.length) {  //name string
                    top.categoryName = util.trim(xss(fields.category[0])); 
                }
                if (fields.subcategory && fields.subcategory.length) { //name string, cat name obj saving will be below
                    subcategory = util.trim(xss(fields.subcategory[0])); 
                    top.subcategoryName = util.trim(xss(fields.subcategory[0])); 
                }               
                if (fields.top1_id && fields.top1_id.length) { 
                    top.top1_id = util.trim(xss(fields.top1_id[0])); 
                }
                if (fields.top2_id && fields.top2_id.length) { 
                    top.top2_id = util.trim(xss(fields.top2_id[0])); 
                }
                if (fields.top3_id && fields.top3_id.length) { 
                    top.top3_id = util.trim(xss(fields.top3_id[0])); 
                }
                if (fields.top4_id && fields.top4_id.length) { 
                    top.top4_id = util.trim(xss(fields.top4_id[0])); 
                }
                if (fields.top5_id && fields.top5_id.length) { 
                    top.top5_id = util.trim(xss(fields.top5_id[0])); 
                }
                if (fields.top6_id && fields.top6_id.length) { 
                    top.top6_id = util.trim(xss(fields.top6_id[0])); 
                }
                if (fields.top7_id && fields.top7_id.length) { 
                    top.top7_id = util.trim(xss(fields.top7_id[0])); 
                }
                if (fields.top8_id && fields.top8_id.length) { 
                    top.top8_id = util.trim(xss(fields.top8_id[0])); 
                }
                if (fields.top9_id && fields.top9_id.length) { 
                    top.top9_id = util.trim(xss(fields.top9_id[0])); 
                }
                if (fields.top10_id && fields.top10_id.length) { 
                    top.top10_id = util.trim(xss(fields.top10_id[0])); 
                }
                
                if (fields.qa_title1 && fields.qa_title1.length) { 
                    top.qa_title1 = util.trim(xss(fields.qa_title1[0])); 
                }
                if (fields.qa_content1 && fields.qa_content1.length) { 
                    top.qa_content1 = util.trim(xss(fields.qa_content1[0])); 
                }
                if (fields.qa_title1_h3_1 && fields.qa_title1_h3_1.length) { 
                    top.qa_title1_h3_1 = util.trim(xss(fields.qa_title1_h3_1[0])); 
                }
                if (fields.qa_content1_h3_1 && fields.qa_content1_h3_1.length) { 
                    top.qa_content1_h3_1 = util.trim(xss(fields.qa_content1_h3_1[0])); 
                }
                if (fields.qa_title1_h3_2 && fields.qa_title1_h3_2.length) { 
                    top.qa_title1_h3_2 = util.trim(xss(fields.qa_title1_h3_2[0])); 
                }
                if (fields.qa_content1_h3_2 && fields.qa_content1_h3_2.length) { 
                    top.qa_content1_h3_2 = util.trim(xss(fields.qa_content1_h3_2[0])); 
                }
                if (fields.qa_title1_h3_3 && fields.qa_title1_h3_3.length) { 
                    top.qa_title1_h3_3 = util.trim(xss(fields.qa_title1_h3_3[0])); 
                }
                if (fields.qa_content1_h3_3 && fields.qa_content1_h3_3.length) { 
                    top.qa_content1_h3_3 = util.trim(xss(fields.qa_content1_h3_3[0])); 
                }
                if (fields.qa_title1_h3_4 && fields.qa_title1_h3_4.length) { 
                    top.qa_title1_h3_4 = util.trim(xss(fields.qa_title1_h3_4[0])); 
                }
                if (fields.qa_content1_h3_4 && fields.qa_content1_h3_4.length) { 
                    top.qa_content1_h3_4 = util.trim(xss(fields.qa_content1_h3_4[0])); 
                }
                if (fields.qa_title1_h3_5 && fields.qa_title1_h3_5.length) { 
                    top.qa_title1_h3_5 = util.trim(xss(fields.qa_title1_h3_5[0])); 
                }
                if (fields.qa_content1_h3_5 && fields.qa_content1_h3_5.length) { 
                    top.qa_content1_h3_5 = util.trim(xss(fields.qa_content1_h3_5[0])); 
                }
                
                if (fields.qa_title2 && fields.qa_title2.length) { 
                    top.qa_title2 = util.trim(xss(fields.qa_title2[0])); 
                }
                if (fields.qa_content2 && fields.qa_content2.length) { 
                    top.qa_content2 = util.trim(xss(fields.qa_content2[0])); 
                }
                if (fields.qa_title2_h3_1 && fields.qa_title2_h3_1.length) { 
                    top.qa_title2_h3_1 = util.trim(xss(fields.qa_title2_h3_1[0])); 
                }
                if (fields.qa_content2_h3_1 && fields.qa_content2_h3_1.length) { 
                    top.qa_content2_h3_1 = util.trim(xss(fields.qa_content2_h3_1[0])); 
                }
                if (fields.qa_title2_h3_2 && fields.qa_title2_h3_2.length) { 
                    top.qa_title2_h3_2 = util.trim(xss(fields.qa_title2_h3_2[0])); 
                }
                if (fields.qa_content2_h3_2 && fields.qa_content2_h3_2.length) { 
                    top.qa_content2_h3_2 = util.trim(xss(fields.qa_content2_h3_2[0])); 
                }
                if (fields.qa_title2_h3_3 && fields.qa_title2_h3_3.length) { 
                    top.qa_title2_h3_3 = util.trim(xss(fields.qa_title2_h3_3[0])); 
                }
                if (fields.qa_content2_h3_3 && fields.qa_content2_h3_3.length) { 
                    top.qa_content2_h3_3 = util.trim(xss(fields.qa_content2_h3_3[0])); 
                }
                if (fields.qa_title2_h3_4 && fields.qa_title2_h3_4.length) { 
                    top.qa_title2_h3_4 = util.trim(xss(fields.qa_title2_h3_4[0])); 
                }
                if (fields.qa_content2_h3_4 && fields.qa_content2_h3_4.length) { 
                    top.qa_content2_h3_4 = util.trim(xss(fields.qa_content2_h3_4[0])); 
                }
                if (fields.qa_title2_h3_5 && fields.qa_title2_h3_5.length) { 
                    top.qa_title2_h3_5 = util.trim(xss(fields.qa_title2_h3_5[0])); 
                }
                if (fields.qa_content2_h3_5 && fields.qa_content2_h3_5.length) { 
                    top.qa_content2_h3_5 = util.trim(xss(fields.qa_content2_h3_5[0])); 
                }
                
                if (fields.qa_title3 && fields.qa_title3.length) { 
                    top.qa_title3 = util.trim(xss(fields.qa_title3[0])); 
                }
                if (fields.qa_content3 && fields.qa_content3.length) { 
                    top.qa_content3 = util.trim(xss(fields.qa_content3[0])); 
                }
                if (fields.qa_title3_h3_1 && fields.qa_title3_h3_1.length) { 
                    top.qa_title3_h3_1 = util.trim(xss(fields.qa_title3_h3_1[0])); 
                }
                if (fields.qa_content3_h3_1 && fields.qa_content3_h3_1.length) { 
                    top.qa_content3_h3_1 = util.trim(xss(fields.qa_content3_h3_1[0])); 
                }
                if (fields.qa_title3_h3_2 && fields.qa_title3_h3_2.length) { 
                    top.qa_title3_h3_2 = util.trim(xss(fields.qa_title3_h3_2[0])); 
                }
                if (fields.qa_content3_h3_2 && fields.qa_content3_h3_2.length) { 
                    top.qa_content3_h3_2 = util.trim(xss(fields.qa_content3_h3_2[0])); 
                }
                if (fields.qa_title3_h3_3 && fields.qa_title3_h3_3.length) { 
                    top.qa_title3_h3_3 = util.trim(xss(fields.qa_title3_h3_3[0])); 
                }
                if (fields.qa_content3_h3_3 && fields.qa_content3_h3_3.length) { 
                    top.qa_content3_h3_3 = util.trim(xss(fields.qa_content3_h3_3[0])); 
                }
                if (fields.qa_title3_h3_4 && fields.qa_title3_h3_4.length) { 
                    top.qa_title3_h3_4 = util.trim(xss(fields.qa_title3_h3_4[0])); 
                }
                if (fields.qa_content3_h3_4 && fields.qa_content3_h3_4.length) { 
                    top.qa_content3_h3_4 = util.trim(xss(fields.qa_content3_h3_4[0])); 
                }
                if (fields.qa_title3_h3_5 && fields.qa_title3_h3_5.length) { 
                    top.qa_title3_h3_5 = util.trim(xss(fields.qa_title3_h3_5[0])); 
                }
                if (fields.qa_content3_h3_5 && fields.qa_content3_h3_5.length) { 
                    top.qa_content3_h3_5 = util.trim(xss(fields.qa_content3_h3_5[0])); 
                }
                
                if (fields.qa_title4 && fields.qa_title4.length) { 
                    top.qa_title4 = util.trim(xss(fields.qa_title4[0])); 
                }
                if (fields.qa_content4 && fields.qa_content4.length) { 
                    top.qa_content4 = util.trim(xss(fields.qa_content4[0])); 
                }
                if (fields.qa_title4_h3_1 && fields.qa_title4_h3_1.length) { 
                    top.qa_title4_h3_1 = util.trim(xss(fields.qa_title4_h3_1[0])); 
                }
                if (fields.qa_content4_h3_1 && fields.qa_content4_h3_1.length) { 
                    top.qa_content4_h3_1 = util.trim(xss(fields.qa_content4_h3_1[0])); 
                }
                if (fields.qa_title4_h3_2 && fields.qa_title4_h3_2.length) { 
                    top.qa_title4_h3_2 = util.trim(xss(fields.qa_title4_h3_2[0])); 
                }
                if (fields.qa_content4_h3_2 && fields.qa_content4_h3_2.length) { 
                    top.qa_content4_h3_2 = util.trim(xss(fields.qa_content4_h3_2[0])); 
                }
                if (fields.qa_title4_h3_3 && fields.qa_title4_h3_3.length) { 
                    top.qa_title4_h3_3 = util.trim(xss(fields.qa_title4_h3_3[0])); 
                }
                if (fields.qa_content4_h3_3 && fields.qa_content4_h3_3.length) { 
                    top.qa_content4_h3_3 = util.trim(xss(fields.qa_content4_h3_3[0])); 
                }
                if (fields.qa_title4_h3_4 && fields.qa_title4_h3_4.length) { 
                    top.qa_title4_h3_4 = util.trim(xss(fields.qa_title4_h3_4[0])); 
                }
                if (fields.qa_content4_h3_4 && fields.qa_content4_h3_4.length) { 
                    top.qa_content4_h3_4 = util.trim(xss(fields.qa_content4_h3_4[0])); 
                }
                if (fields.qa_title4_h3_5 && fields.qa_title4_h3_5.length) { 
                    top.qa_title4_h3_5 = util.trim(xss(fields.qa_title4_h3_5[0])); 
                }
                if (fields.qa_content4_h3_5 && fields.qa_content4_h3_5.length) { 
                    top.qa_content4_h3_5 = util.trim(xss(fields.qa_content4_h3_5[0])); 
                }
                
                if (fields.qa_title5 && fields.qa_title5.length) { 
                    top.qa_title5 = util.trim(xss(fields.qa_title5[0])); 
                }
                if (fields.qa_content5 && fields.qa_content5.length) { 
                    top.qa_content5 = util.trim(xss(fields.qa_content5[0])); 
                }
                if (fields.qa_title5_h3_1 && fields.qa_title5_h3_1.length) { 
                    top.qa_title5_h3_1 = util.trim(xss(fields.qa_title5_h3_1[0])); 
                }
                if (fields.qa_content5_h3_1 && fields.qa_content5_h3_1.length) { 
                    top.qa_content5_h3_1 = util.trim(xss(fields.qa_content5_h3_1[0])); 
                }
                if (fields.qa_title5_h3_2 && fields.qa_title5_h3_2.length) { 
                    top.qa_title5_h3_2 = util.trim(xss(fields.qa_title5_h3_2[0])); 
                }
                if (fields.qa_content5_h3_2 && fields.qa_content5_h3_2.length) { 
                    top.qa_content5_h3_2 = util.trim(xss(fields.qa_content5_h3_2[0])); 
                }
                if (fields.qa_title5_h3_3 && fields.qa_title5_h3_3.length) { 
                    top.qa_title5_h3_3 = util.trim(xss(fields.qa_title5_h3_3[0])); 
                }
                if (fields.qa_content5_h3_3 && fields.qa_content5_h3_3.length) { 
                    top.qa_content5_h3_3 = util.trim(xss(fields.qa_content5_h3_3[0])); 
                }
                if (fields.qa_title5_h3_4 && fields.qa_title5_h3_4.length) { 
                    top.qa_title5_h3_4 = util.trim(xss(fields.qa_title5_h3_4[0])); 
                }
                if (fields.qa_content5_h3_4 && fields.qa_content5_h3_4.length) { 
                    top.qa_content5_h3_4 = util.trim(xss(fields.qa_content5_h3_4[0])); 
                }
                if (fields.qa_title5_h3_5 && fields.qa_title5_h3_5.length) { 
                    top.qa_title5_h3_5 = util.trim(xss(fields.qa_title5_h3_5[0])); 
                }
                if (fields.qa_content5_h3_5 && fields.qa_content5_h3_5.length) { 
                    top.qa_content5_h3_5 = util.trim(xss(fields.qa_content5_h3_5[0])); 
                }
                
                if (fields.qa_title6 && fields.qa_title6.length) { 
                    top.qa_title6 = util.trim(xss(fields.qa_title6[0])); 
                }
                if (fields.qa_content6 && fields.qa_content6.length) { 
                    top.qa_content6 = util.trim(xss(fields.qa_content6[0])); 
                }
                if (fields.qa_title6_h3_1 && fields.qa_title6_h3_1.length) { 
                    top.qa_title6_h3_1 = util.trim(xss(fields.qa_title6_h3_1[0])); 
                }
                if (fields.qa_content6_h3_1 && fields.qa_content6_h3_1.length) { 
                    top.qa_content6_h3_1 = util.trim(xss(fields.qa_content6_h3_1[0])); 
                }
                if (fields.qa_title6_h3_2 && fields.qa_title6_h3_2.length) { 
                    top.qa_title6_h3_2 = util.trim(xss(fields.qa_title6_h3_2[0])); 
                }
                if (fields.qa_content6_h3_2 && fields.qa_content6_h3_2.length) { 
                    top.qa_content6_h3_2 = util.trim(xss(fields.qa_content6_h3_2[0])); 
                }
                if (fields.qa_title6_h3_3 && fields.qa_title6_h3_3.length) { 
                    top.qa_title6_h3_3 = util.trim(xss(fields.qa_title6_h3_3[0])); 
                }
                if (fields.qa_content6_h3_3 && fields.qa_content6_h3_3.length) { 
                    top.qa_content6_h3_3 = util.trim(xss(fields.qa_content6_h3_3[0])); 
                }
                if (fields.qa_title6_h3_4 && fields.qa_title6_h3_4.length) { 
                    top.qa_title6_h3_4 = util.trim(xss(fields.qa_title6_h3_4[0])); 
                }
                if (fields.qa_content6_h3_4 && fields.qa_content6_h3_4.length) { 
                    top.qa_content6_h3_4 = util.trim(xss(fields.qa_content6_h3_4[0])); 
                }
                if (fields.qa_title6_h3_5 && fields.qa_title6_h3_5.length) { 
                    top.qa_title6_h3_5 = util.trim(xss(fields.qa_title6_h3_5[0])); 
                }
                if (fields.qa_content6_h3_5 && fields.qa_content6_h3_5.length) { 
                    top.qa_content6_h3_5 = util.trim(xss(fields.qa_content6_h3_5[0])); 
                }
                
                if (fields.qa_title7 && fields.qa_title7.length) { 
                    top.qa_title7 = util.trim(xss(fields.qa_title7[0])); 
                }
                if (fields.qa_content7 && fields.qa_content7.length) { 
                    top.qa_content7 = util.trim(xss(fields.qa_content7[0])); 
                }
                if (fields.qa_title7_h3_1 && fields.qa_title7_h3_1.length) { 
                    top.qa_title7_h3_1 = util.trim(xss(fields.qa_title7_h3_1[0])); 
                }
                if (fields.qa_content7_h3_1 && fields.qa_content7_h3_1.length) { 
                    top.qa_content7_h3_1 = util.trim(xss(fields.qa_content7_h3_1[0])); 
                }
                if (fields.qa_title7_h3_2 && fields.qa_title7_h3_2.length) { 
                    top.qa_title7_h3_2 = util.trim(xss(fields.qa_title7_h3_2[0])); 
                }
                if (fields.qa_content7_h3_2 && fields.qa_content7_h3_2.length) { 
                    top.qa_content7_h3_2 = util.trim(xss(fields.qa_content7_h3_2[0])); 
                }
                if (fields.qa_title7_h3_3 && fields.qa_title7_h3_3.length) { 
                    top.qa_title7_h3_3 = util.trim(xss(fields.qa_title7_h3_3[0])); 
                }
                if (fields.qa_content7_h3_3 && fields.qa_content7_h3_3.length) { 
                    top.qa_content7_h3_3 = util.trim(xss(fields.qa_content7_h3_3[0])); 
                }
                if (fields.qa_title7_h3_4 && fields.qa_title7_h3_4.length) { 
                    top.qa_title7_h3_4 = util.trim(xss(fields.qa_title7_h3_4[0])); 
                }
                if (fields.qa_content7_h3_4 && fields.qa_content7_h3_4.length) { 
                    top.qa_content7_h3_4 = util.trim(xss(fields.qa_content7_h3_4[0])); 
                }
                if (fields.qa_title7_h3_5 && fields.qa_title7_h3_5.length) { 
                    top.qa_title7_h3_5 = util.trim(xss(fields.qa_title7_h3_5[0])); 
                }
                if (fields.qa_content7_h3_5 && fields.qa_content7_h3_5.length) { 
                    top.qa_content7_h3_5 = util.trim(xss(fields.qa_content7_h3_5[0])); 
                }
                
                if (fields.qa_title8 && fields.qa_title8.length) { 
                    top.qa_title8 = util.trim(xss(fields.qa_title8[0])); 
                }
                if (fields.qa_content8 && fields.qa_content8.length) { 
                    top.qa_content8 = util.trim(xss(fields.qa_content8[0])); 
                }
                if (fields.qa_title8_h3_1 && fields.qa_title8_h3_1.length) { 
                    top.qa_title8_h3_1 = util.trim(xss(fields.qa_title8_h3_1[0])); 
                }
                if (fields.qa_content8_h3_1 && fields.qa_content8_h3_1.length) { 
                    top.qa_content8_h3_1 = util.trim(xss(fields.qa_content8_h3_1[0])); 
                }
                if (fields.qa_title8_h3_2 && fields.qa_title8_h3_2.length) { 
                    top.qa_title8_h3_2 = util.trim(xss(fields.qa_title8_h3_2[0])); 
                }
                if (fields.qa_content8_h3_2 && fields.qa_content8_h3_2.length) { 
                    top.qa_content8_h3_2 = util.trim(xss(fields.qa_content8_h3_2[0])); 
                }
                if (fields.qa_title8_h3_3 && fields.qa_title8_h3_3.length) { 
                    top.qa_title8_h3_3 = util.trim(xss(fields.qa_title8_h3_3[0])); 
                }
                if (fields.qa_content8_h3_3 && fields.qa_content8_h3_3.length) { 
                    top.qa_content8_h3_3 = util.trim(xss(fields.qa_content8_h3_3[0])); 
                }
                if (fields.qa_title8_h3_4 && fields.qa_title8_h3_4.length) { 
                    top.qa_title8_h3_4 = util.trim(xss(fields.qa_title8_h3_4[0])); 
                }
                if (fields.qa_content8_h3_4 && fields.qa_content8_h3_4.length) { 
                    top.qa_content8_h3_4 = util.trim(xss(fields.qa_content8_h3_4[0])); 
                }
                if (fields.qa_title8_h3_5 && fields.qa_title8_h3_5.length) { 
                    top.qa_title8_h3_5 = util.trim(xss(fields.qa_title8_h3_5[0])); 
                }
                if (fields.qa_content8_h3_5 && fields.qa_content8_h3_5.length) { 
                    top.qa_content8_h3_5 = util.trim(xss(fields.qa_content8_h3_5[0])); 
                }
                if (fields.qa_title9 && fields.qa_title9.length) { 
                    top.qa_title9 = util.trim(xss(fields.qa_title9[0])); 
                }
                if (fields.qa_content9 && fields.qa_content9.length) { 
                    top.qa_content9 = util.trim(xss(fields.qa_content9[0])); 
                }
                if (fields.qa_title9_h3_1 && fields.qa_title9_h3_1.length) { 
                    top.qa_title9_h3_1 = util.trim(xss(fields.qa_title9_h3_1[0])); 
                }
                if (fields.qa_content9_h3_1 && fields.qa_content9_h3_1.length) { 
                    top.qa_content9_h3_1 = util.trim(xss(fields.qa_content9_h3_1[0])); 
                }
                if (fields.qa_title9_h3_2 && fields.qa_title9_h3_2.length) { 
                    top.qa_title9_h3_2 = util.trim(xss(fields.qa_title9_h3_2[0])); 
                }
                if (fields.qa_content9_h3_2 && fields.qa_content9_h3_2.length) { 
                    top.qa_content9_h3_2 = util.trim(xss(fields.qa_content9_h3_2[0])); 
                }
                if (fields.qa_title9_h3_3 && fields.qa_title9_h3_3.length) { 
                    top.qa_title9_h3_3 = util.trim(xss(fields.qa_title9_h3_3[0])); 
                }
                if (fields.qa_content9_h3_3 && fields.qa_content9_h3_3.length) { 
                    top.qa_content9_h3_3 = util.trim(xss(fields.qa_content9_h3_3[0])); 
                }
                if (fields.qa_title9_h3_4 && fields.qa_title9_h3_4.length) { 
                    top.qa_title9_h3_4 = util.trim(xss(fields.qa_title9_h3_4[0])); 
                }
                if (fields.qa_content9_h3_4 && fields.qa_content9_h3_4.length) { 
                    top.qa_content9_h3_4 = util.trim(xss(fields.qa_content9_h3_4[0])); 
                }
                if (fields.qa_title9_h3_5 && fields.qa_title9_h3_5.length) { 
                    top.qa_title9_h3_5 = util.trim(xss(fields.qa_title9_h3_5[0])); 
                }
                if (fields.qa_content9_h3_5 && fields.qa_content9_h3_5.length) { 
                    top.qa_content9_h3_5 = util.trim(xss(fields.qa_content9_h3_5[0])); 
                }
                
                if (fields.qa_title10 && fields.qa_title10.length) { 
                    top.qa_title10 = util.trim(xss(fields.qa_title10[0])); 
                }
                if (fields.qa_content10 && fields.qa_content10.length) { 
                    top.qa_content10 = util.trim(xss(fields.qa_content10[0])); 
                }
                if (fields.qa_title10_h3_1 && fields.qa_title10_h3_1.length) { 
                    top.qa_title10_h3_1 = util.trim(xss(fields.qa_title10_h3_1[0])); 
                }
                if (fields.qa_content10_h3_1 && fields.qa_content10_h3_1.length) { 
                    top.qa_content10_h3_1 = util.trim(xss(fields.qa_content10_h3_1[0])); 
                }
                if (fields.qa_title10_h3_2 && fields.qa_title10_h3_2.length) { 
                    top.qa_title10_h3_2 = util.trim(xss(fields.qa_title10_h3_2[0])); 
                }
                if (fields.qa_content10_h3_2 && fields.qa_content10_h3_2.length) { 
                    top.qa_content10_h3_2 = util.trim(xss(fields.qa_content10_h3_2[0])); 
                }
                if (fields.qa_title10_h3_3 && fields.qa_title10_h3_3.length) { 
                    top.qa_title10_h3_3 = util.trim(xss(fields.qa_title10_h3_3[0])); 
                }
                if (fields.qa_content10_h3_3 && fields.qa_content10_h3_3.length) { 
                    top.qa_content10_h3_3 = util.trim(xss(fields.qa_content10_h3_3[0])); 
                }
                if (fields.qa_title10_h3_4 && fields.qa_title10_h3_4.length) { 
                    top.qa_title10_h3_4 = util.trim(xss(fields.qa_title10_h3_4[0])); 
                }
                if (fields.qa_content10_h3_4 && fields.qa_content10_h3_4.length) { 
                    top.qa_content10_h3_4 = util.trim(xss(fields.qa_content10_h3_4[0])); 
                }
                if (fields.qa_title10_h3_5 && fields.qa_title10_h3_5.length) { 
                    top.qa_title10_h3_5 = util.trim(xss(fields.qa_title10_h3_5[0])); 
                }
                if (fields.qa_content10_h3_5 && fields.qa_content10_h3_5.length) { 
                    top.qa_content10_h3_5 = util.trim(xss(fields.qa_content10_h3_5[0])); 
                }     
                if (fields.sendMail && fields.sendMail.length) { 
                    let sendMailValue = util.trim(xss(fields.sendMail ? fields.sendMail[0] : ''))
                    top.sendMail = sendMailValue === 'true';
                }  

            }
            ////for news only
            if(module_type == 'news'){
                if (fields.top1_title && fields.top1_title.length) { top.top1_title = util.trim(xss(fields.top1_title[0])); }
                if (fields.top2_title && fields.top2_title.length) { top.top2_title = util.trim(xss(fields.top2_title[0])); }
                if (fields.top3_title && fields.top3_title.length) { top.top3_title = util.trim(xss(fields.top3_title[0])); }
                if (fields.top4_title && fields.top4_title.length) { top.top4_title = util.trim(xss(fields.top4_title[0])); }
                if (fields.top5_title && fields.top5_title.length) { top.top5_title = util.trim(xss(fields.top5_title[0])); }
                if (fields.top6_title && fields.top6_title.length) { top.top6_title = util.trim(xss(fields.top6_title[0])); }
                if (fields.top7_title && fields.top7_title.length) { top.top7_title = util.trim(xss(fields.top7_title[0])); }
                if (fields.top8_title && fields.top8_title.length) { top.top8_title = util.trim(xss(fields.top8_title[0])); }
                if (fields.top9_title && fields.top9_title.length) { top.top9_title = util.trim(xss(fields.top9_title[0])); }
                if (fields.top10_title && fields.top10_title.length) { top.top10_title = util.trim(xss(fields.top10_title[0])); }
                if (fields.frequency && fields.frequency.length) { top.frequency = util.trim(xss(fields.frequency[0])); }
                if (fields.top1_further_link && fields.top1_further_link.length) { top.top1_further_link = util.trim(xss(fields.top1_further_link[0])); }
                if (fields.top2_further_link && fields.top2_further_link.length) { top.top2_further_link = util.trim(xss(fields.top2_further_link[0])); }
                if (fields.top3_further_link && fields.top3_further_link.length) { top.top3_further_link = util.trim(xss(fields.top3_further_link[0])); }
                if (fields.top4_further_link && fields.top4_further_link.length) { top.top4_further_link = util.trim(xss(fields.top4_further_link[0])); }
                if (fields.top5_further_link && fields.top5_further_link.length) { top.top5_further_link = util.trim(xss(fields.top5_further_link[0])); }
                if (fields.top6_further_link && fields.top6_further_link.length) { top.top6_further_link = util.trim(xss(fields.top6_further_link[0])); }
                if (fields.top7_further_link && fields.top7_further_link.length) { top.top7_further_link = util.trim(xss(fields.top7_further_link[0])); }
                if (fields.top8_further_link && fields.top8_further_link.length) { top.top8_further_link = util.trim(xss(fields.top8_further_link[0])); }
                if (fields.top9_further_link && fields.top9_further_link.length) { top.top9_further_link = util.trim(xss(fields.top9_further_link[0])); }
                if (fields.top10_further_link && fields.top10_further_link.length) { top.top10_further_link = util.trim(xss(fields.top10_further_link[0])); }
                if (fields.top1_youtube && fields.top1_youtube.length) { top.top1_youtube = util.trim(xss(fields.top1_youtube[0])); }
                if (fields.top2_youtube && fields.top2_youtube.length) { top.top2_youtube = util.trim(xss(fields.top2_youtube[0])); }
                if (fields.top3_youtube && fields.top3_youtube.length) { top.top3_youtube = util.trim(xss(fields.top3_youtube[0])); }
                if (fields.top4_youtube && fields.top4_youtube.length) { top.top4_youtube = util.trim(xss(fields.top4_youtube[0])); }
                if (fields.top5_youtube && fields.top5_youtube.length) { top.top5_youtube = util.trim(xss(fields.top5_youtube[0])); }
                if (fields.top6_youtube && fields.top6_youtube.length) { top.top6_youtube = util.trim(xss(fields.top6_youtube[0])); }
                if (fields.top7_youtube && fields.top7_youtube.length) { top.top7_youtube = util.trim(xss(fields.top7_youtube[0])); }
                if (fields.top8_youtube && fields.top8_youtube.length) { top.top8_youtube = util.trim(xss(fields.top8_youtube[0])); }
                if (fields.top9_youtube && fields.top9_youtube.length) { top.top9_youtube = util.trim(xss(fields.top9_youtube[0])); }
                if (fields.top10_youtube && fields.top10_youtube.length) { top.top10_youtube = util.trim(xss(fields.top10_youtube[0])); }
                if (fields.issueNum && fields.issueNum.length) { top.issueNum = util.trim(xss(fields.issueNum[0])); }
                
                if (fields.topArticle1 && fields.topArticle1.length) { top.topArticle1 = util.trim(xss(fields.topArticle1[0])); }      
                if (fields.topArticle2 && fields.topArticle2.length) { top.topArticle2 = util.trim(xss(fields.topArticle2[0])); } 

                if (fields.open1 && fields.open1.length) { top.open1 = util.trim(xss(fields.open1[0])); } 
                if (fields.open2 && fields.open2.length) { top.open2 = util.trim(xss(fields.open2[0])); } 
                
                if (fields.prompt1 && fields.prompt1.length) { top.prompt1 = util.trim(xss(fields.prompt1[0])); } 
                if (fields.prompt2 && fields.prompt2.length) { top.prompt2 = util.trim(xss(fields.prompt2[0])); } 

                if (fields.outTop1_title && fields.outTop1_title.length) { top.outTop1_title = util.trim(xss(fields.outTop1_title[0])); }
                if (fields.outTop2_title && fields.outTop2_title.length) { top.outTop2_title = util.trim(xss(fields.outTop2_title[0])); }
                if (fields.outTop3_title && fields.outTop3_title.length) { top.outTop3_title = util.trim(xss(fields.outTop3_title[0])); }
                if (fields.outTop1_content && fields.outTop1_content.length) { top.outTop1_content = util.trim(xss(fields.outTop1_content[0])); }
                if (fields.outTop2_content && fields.outTop2_content.length) { top.outTop2_content = util.trim(xss(fields.outTop2_content[0])); }
                if (fields.outTop3_content && fields.outTop3_content.length) { top.outTop3_content = util.trim(xss(fields.outTop3_content[0])); }
                if (fields.outTop1_further_link && fields.outTop1_further_link.length) { top.outTop1_further_link = util.trim(xss(fields.outTop1_further_link[0])); }
                if (fields.outTop2_further_link && fields.outTop2_further_link.length) { top.outTop2_further_link = util.trim(xss(fields.outTop2_further_link[0])); }
                if (fields.outTop3_further_link && fields.outTop3_further_link.length) { top.outTop3_further_link = util.trim(xss(fields.outTop3_further_link[0])); }
                if (fields.outTop1_youtube && fields.outTop1_youtube.length) { top.outTop1_youtube = util.trim(xss(fields.outTop1_youtube[0])); }
                if (fields.outTop2_youtube && fields.outTop2_youtube.length) { top.outTop2_youtube = util.trim(xss(fields.outTop2_youtube[0])); }
                if (fields.outTop3_youtube && fields.outTop3_youtube.length) { top.outTop3_youtube = util.trim(xss(fields.outTop3_youtube[0])); }
            }
            logger.info(`top details before save()  without cat: ${JSON.stringify(top)}`)
            top.save(async (err,atop)=>{
                  if(err){
                        logger.error('Top Article save error: ' +  err);
                        req.flash('error',`there is some errors when save the post ${err}`);
                        res.redirect('back');
                   }else{
                        //logger.info(`top.imgs: ${JSON.stringify(atop.imgs)}`
                        let top_id = atop._id;
                        let cat = {catName: category, subcatName:''};
                        // console.log(`cat obj: ${JSON.stringify(cat)}`);
                        if(module_type == 'gadgets' || module_type == 'sites'){
                            if(category ){
                                await topProxy.saveCategory(req, res, cat, Category, Top, top_id, 'category');
                            }
                            if(subcategory){ //when setting root url  like  /video, there will be a blank subcategory
                                cat.subcatName = subcategory;
                                await topProxy.saveCategory(req, res, cat, Subcategory,Top,top_id,'subcategory');
                            }
                        }else if(module_type == 'news'){
                            await topProxy.saveCategory(req, res, cat, TopNewsCategory, TopNews, top_id, 'news');
                        }
                        logger.info(`top details after save() with cat : ${JSON.stringify(atop)}`)
                        // await topProxy.saveCategory(req, res, cat, TopNewsCategory, Top, top_id, 'category');
                        // await tagProxy.saveSingle(product_id, tags, Product, Tag);
                        atop = atop.processTop(atop);
                        logger.info(`processtoppedAtop: ${JSON.stringify(atop)}`);
                       // if(atop.sendMail){

                       let topArticle1,topArticle2,prompt1,prompt2,open1,open2;
                       if(top.topArticle1){topArticle1 = await Top.findOne({_id: atop.topArticle1}).exec();}
                       if(top.topArticle2){
                         topArticle2 = await Top.findOne({_id: atop.topArticle2}).exec();
                       }
                       if(top.prompt1){
                        prompt1 = await Prompt.findOne({_id: atop.prompt1}).exec();
                       }
                       if(top.prompt2){
                         prompt2 = await Prompt.findOne({_id: atop.prompt2}).exec();
                       }
                       if(top.open1){open1 = await Open.findOne({_id: atop.open1}).exec();}
                       if(top.open2){
                         open2 = await Open.findOne({_id: atop.open2}).exec();
                       }

                      //  }
                      //  tagProxy.saveSingle(product_id, fields.tags, Product, Tag);
                        // logger.info(`pros: ${JSON.stringify(data.pros)} `);
                        logger.info(`your website data saved successfully: ${atop._id}`);
                        req.flash('success','Your website data saved successfully');
                        if(module_type == 'news'){
                            //send to test mail
                            // let newsletterMails = await NewsletterMail.find().exec();
                            // const emailArray = ['frank25184@sina.com'];//newsletterMails.map(item => item.email);
                            // logger.info(`emailArray: ${JSON.stringify(emailArray)}`);
                            //send mail
                            let latestTools = await Site.find({
                                created_at: {
                                    $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
                                    $lte: new Date()
                                },
                                hidden: false
                            })
                            .sort({ createdAt: -1 })
                            .select('name name_changed imgs seoDescription')
                            .limit(8)
                            .exec();
                            latestTools =  await siteProxy.modifySitesAsync(latestTools);
                            res.render('email/newsletter',
                                {layout:null, user,atop,topArticle1,topArticle2,prompt1,prompt2,open1,open2,latestTools}, (err,html)=>{
                                    if(err){logger.info('err in email template', err);}
                                    try{
                                        mailService.send(user.email,'Top AI Weely News & Resources This Week',html);
                                        logger.info(`send to ${user.email} done`);
                                    }catch(ex){
                                        mailService.mailError('The email widget broke down!', __filename,ex);
                                    }
                                }
                           );
                            res.redirect(`/issue/${atop.tertiaryPath}`);
                        }else if(module_type == 'gadgets' || module_type == 'sites'){
                            // logger.info(`atop.category: ${atop.category}`);
                            // let category = await  Category.findOne({_id: atop.category}).exec();
                            // category = category.processCategory(category);
                            res.redirect(`/top/${atop.tertiaryPath}`);
                            
                        }
  
  
                  }
            });
  
        });
  
   
    },
    makeTopArticle: (req,res)=>{
        let user = req.user;
        let isAdmin = false;
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
        }
          res.render('form/top', {
              layout: 'new',
              isAdmin,
                user: req.user.processUser(req.user),
                messages: {
                      error: req.flash('error'),
                      success: req.flash('success'),
                      info: req.flash('info'),
                },                  
  
          });
    },
    showProducts: async (req, res)=>{
            //let { secondaryPath, tertiaryPath } = req.params;
            let user = req.user;
            let isAdmin = false;
            if(user){
                user = user.processUser(user);
                isAdmin = user.admin;
            }
            let loginedUser;
            if(req.user){
                loginedUser = req.user.processUser(req.user);
            }
            let tertiaryPath = req.params.tertiaryPath;
            let author;
            // 检查类别是否有效
                let top;
                try {
                    top = await Top.findOne({tertiaryPath}).exec();
                    let products;
                    top = await top.processTop(top);
                    logger.info('top:', JSON.stringify(top));
                    author = await User.findById({_id: top.user_id}).exec();
                    if (top) {
                        //update top page pv +1
                        var conditions = { title:top.title },
                        update = { $inc: { 'pv': 1 }};//increment
                        await Top.findOneAndUpdate(conditions, update).exec();  
        
                        // Step 2: Collect existing site IDs and maintain order
                        //const siteIds = [];
                        // for (let i = 1; i <= 10; i++) {
                        // 	const field = `top${i}_id`;
                        // 	siteIds.push(top[field] || null); // Push null if the field doesn't exist
                        // }
                        let {top1_id, top2_id, top3_id, top4_id, top5_id, top6_id, top7_id, top8_id, top9_id, top10_id, top1_content, top2_content, top3_content, top4_content, top5_content, top6_content, top7_content, top8_content, top9_content, top10_content} = top;
                        const siteIds = [top1_id, top2_id, top3_id, top4_id, top5_id, top6_id, top7_id, top8_id, top9_id, top10_id];
        
                        // Step 3: Fetch the Site documents using the collected IDs
                        let sites;
                        if(top.isSite){
                            sites = await Site.find({ _id: { $in: siteIds.filter(id => id) } }).exec();
                            sites = await siteProxy.modifySitesAsync(sites);
                        }else{
                            sites = await Gadget.find({ _id: { $in: siteIds.filter(id => id) } }).exec();
                            sites = await gadgetProxy.modifySitesAsync(sites);
                        }
                        // 将 sites 按照 siteIds 的顺序排序
                        sites = sites.sort((a, b) => {
                            return siteIds.indexOf(a._id.toString()) - siteIds.indexOf(b._id.toString());
                        });
                        // Step 4: Create an ordered array for the sites with index
                        products = sites.map((pro, index) => {
                            let siteId = pro._id.toString(); // Convert ObjectId to string
                            // Check if siteId matches any of the top ids and add the corresponding content
                            if (siteId === top1_id) {
                            pro.topContent = top1_content;
                            } else if (siteId === top2_id) {
                            pro.topContent = top2_content;
                            } else if (siteId === top3_id) {
                            pro.topContent = top3_content;
                            } else if (siteId === top4_id) {
                            pro.topContent = top4_content;
                            } else if (siteId === top5_id) {
                            pro.topContent = top5_content;
                            } else if (siteId === top6_id) {
                            pro.topContent = top6_content;
                            } else if (siteId === top7_id) {
                            pro.topContent = top7_content;
                            } else if (siteId === top8_id) {
                            pro.topContent = top8_content;
                            } else if (siteId === top9_id) {
                            pro.topContent = top9_content;
                            } else if (siteId === top10_id) {
                            pro.topContent = top10_content;
                            }
                            index = index +1;
                            // pro.topContent = top[`top${index}_content`]; 
                            pro.index = index; // Add the index to each product
                            return pro;
                        });
                        // Now you can use the orderedSites array
                        //console.log('Ordered products:', products);
        
                        //for top thumbnail images from the top 10 product
                        const extractFirstImages = (sites) => {
                            return sites.map(function (site) {
                              return {
                                img: site.imgs[0], // Get the first image
                                name: site.name    // Get the name of the site
                              };
                            });
                          };
                        top.tenObjArr = extractFirstImages(sites);;
        
                        // let topCategory = await TopCategory.findOne({_id: top.category}).exec();
                        // let topSubcategory = await TopSubcategory.findOne({_id: top.subcategory}).exec();
                        // top.categoryName = topCategory.name;
                        // top.subcategoryName = topSubcategory.name;
        
                        let isUpvoted = util.userUpvote(loginedUser,top._id,'top');//true or false;
                        let alternatives = await Top.find({category: top.category}).limit(3).exec();
                        let alternativesAll = await Top.find({category: top.category}).exec();
                        logger.info('alternatives '+ JSON.stringify(alternatives))
                        //logger.info('alternativesALL '+ JSON.stringify(alternativesAll))
                        alternatives = await topProxy.modifySitesAsync(alternatives);
                        alternativesAll = await topProxy.modifySitesAsync(alternativesAll);
                        // alternatives = alternatives.map(function(v){
                        //   v.tagsArray =  util.stringToArray(v.tagsString)
                        //   return v;
                        // });
                          //get three random items from an array
                          // Define an empty array to hold the selected items
                          const selectedItems = [];
                          // Check if there are more than 1 items in the `alternatives` array
                          if (alternatives.length >= 3 ) {
                            // Select three random items from the array
                            console.log('into alternatives.length >= 3')
                            while (selectedItems.length < 3) {
                              const randomIndex = Math.floor(Math.random() * alternatives.length);
                              const selectedItem = alternatives[randomIndex];
                              if (!selectedItems.includes(selectedItem)) {
                                selectedItems.push(selectedItem);
                              }
                            }
                          } else if (alternatives.length === 2) {
                            console.log('into alternatives.length == 2')
                            while (selectedItems.length < 2) {
                              const randomIndex = Math.floor(Math.random() * alternatives.length);
                              const selectedItem = alternatives[randomIndex];
                              if (!selectedItems.includes(selectedItem)) {
                                selectedItems.push(selectedItem);
                              }
                            }
                          }
                            else if (alternatives.length === 1) {
                            console.log('into alternatives.length == 1')
                            selectedItems.push(alternatives[0]);
                          }
                          
                        // 找到文章，返回内容
                        res.render('top/showOne',{
                            top,
                            products,
                            isUpvoted,
                            alternativesThree:selectedItems,
                            alternativesAll,
                           // categoriesObj,
                            user: req.user ? req.user.processUser(req.user) : req.user,
                            author,
                            seo: {
                                title: top.seoTitle,
                                keywords:  top.seoKeyword,
                                description:  top.seoDescription,
                            },
                            env:{
                                cspNonce: res.locals.cspNonce
                            },
                             messages: {
                                   error: req.flash('error'),
                                   success: req.flash('success'),
                                   info: req.flash('info'),
                             }            
              
                       })
        
                    } else {
                        console.log('No top entry found for the given title.');
                        res.redirect('back');
                    }
                        //logger.info(`top: ${JSON.stringify(top)}`);
                    // 查询数据库，查找匹配的文章
        
                } catch (error) {
                    console.error(error);
                    res.status(500).send('Server error');
                }
        
    }



}

