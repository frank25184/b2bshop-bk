"use strict";
let moment = require('moment'),
    Post = require('../models/Post'),
    User = require('../models/User'),
    Comment = require('../models/Comment'),
    Tag = require('../models/PostTag'),
    postProxy = require('../db_proxy/post'),
    Category = require('../models/PostCategory'),
    Subcategory = require('../models/PostSubcategory'),
    tagProxy = require('../db_proxy/tag'),
    logger = require('../libs/logger'),
    config  = require('../common/get-config'),
    util = require('../libs/utility'),
    { IncomingForm }  = require('formidable'),
    xss = require('xss'),
    cheerio = require('cheerio'),
    asyncErrHandle = require('../common/asyncErrHandle');

    let mongoose = require('mongoose');
module.exports = {
      getPersonalPosts: (req,res)=>{
                  const user_id = req.params.user_id;                                  
                  postProxy.getPostsByUserId(req,res,user_id,'post/personalPosts');
       },

       showPost: (req,res)=>{
             const pathName = req.params.pathName.toLowerCase();
             console.log('pathName is '+pathName);
             postProxy.getPostByPathName(req,res,pathName,'post/showOne');      
       },
       getModify: async (req,res) => {
        let pathName = req.params.pathName;
        let post = await Post.findOne({pathName}).populate('category').populate('subcategory').exec();
        logger.info(`post: ${JSON.stringify(post)}`);
        res.render('form/modifyPost', {
            post,
            seo: {
                title: `Modify a Post`,
                keywords: `modify a Post`,
                description: `Modify a Post!`,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user ? req.user.processUser(req.user) : req.user,
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }            
        });
       },
       postModify: async (req, res) => { //error:     "seoKeywords" : "",topIMG" : "", category，subcategory
        try {
            const pathName = req.params.pathName;
    
            // Set up file upload directory
            let uploadDir = config.uploadDir + 'articles/thumbnail/';
            util.checkDir(uploadDir);
            
            const form = new IncomingForm({
                multiples: false,  // Changed to false since we only allow single image upload
                maxFileSize: 5 * 1024 * 1024, // 5MB
                keepExtensions: true,
                uploadDir: uploadDir,
                allowEmptyFiles: false,
                minFileSize: 0,
                filename: function(name, ext, part) {
                    if (!part.originalFilename || part.originalFilename.trim().length === 0) {
                        return undefined;
                    } else {
                        const timestamp = new Date().getTime();  
                        const seconds = Math.floor(timestamp / 1000);
                        name = util.urlBeautify(name);
                        return `${seconds}-${name}${ext}`;  
                    }
                }
            });
            console.log('below form');
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    logger.error('Error parsing form data:', err);
                    req.flash('error', 'Error processing form data');
                    return res.redirect('back');
                }
                console.log('fields: ', JSON.stringify(fields));
                console.log('files: ', JSON.stringify(files));
    
                try {
                    // Find the post to update
                    const post = await Post.findOne({ pathName });
                    if (!post) {
                        req.flash('error', 'Post not found');
                        return res.redirect('back');
                    }

                    // Process images
                    let topIMG = post.topIMG; // Keep existing image by default
    
                    // If there's a new image uploaded
                    if (files && files.topIMG?.length && files.topIMG[0]?.size > 0) {
                        topIMG = files.topIMG[0].newFilename;
                    } 
                    // // If existing image was removed
                    // if (!fields['existingImages[]'] || 
                    //          (Array.isArray(fields['existingImages[]']) && fields['existingImages[]'].length === 0) ||
                    //          (!Array.isArray(fields['existingImages[]']) && !fields['existingImages[]'])) {
                    //     topIMG = topIMG;
                    // }
    
                    // Process content - clean and format
                    let content = util.trim(xss(fields.content || ''));
                    if (content) {
                        console.log('into content');
                        const $ = cheerio.load(content, { decodeEntities: false });
                        const $tables = $('table');
                        
                        if ($tables.length > 0) {
                            $tables.each(function() {
                                const $table = $(this);
                                $table.addClass('table table-bordered');
                                $table.css({
                                    'text-align': 'center',
                                    'vertical-align': 'middle',
                                    'width': '100%',
                                    'margin-bottom': '0',
                                    'table-layout': 'auto'
                                });
                                
                                $table.find('>:not(caption)>*>*').css({
                                    'padding': '0.8rem 0.8rem'
                                });
                                
                                $table.find('td p').css({ 
                                    'margin-bottom': '0rem'
                                });
                                
                                const $wrapper = $('<div class="table-responsive"></div>').css({
                                    'overflow-y': 'auto',
                                    'margin-bottom': '1rem',
                                    'border': '1px solid #dee2e6',
                                    'border-radius': '0.25rem'
                                });
                                
                                $table.wrap($wrapper);
                            });
                            
                            content = $.html();
                        }
                    }
                   let category = util.trim(xss(fields.category || '')),
                   subcategory = util.trim(xss(fields.subcategory || ''));
    
                    // Update post data
                    const updateData = {
                        title: util.trim(xss(fields.name || '')),
                        title_changed: util.urlBeautify(util.trim(xss(fields.name || ''))),
                        pathName: util.urlBeautify(util.trim(xss(fields.pathName || ''))),
                        content,
                        intro: util.trim(xss(fields.intro || '')),
                        seoTitle: util.trim(xss(fields.seoTitle || '')),
                        seoKeywords: util.trim(xss(fields.seoKeywords || '')),
                        seoDescription: util.trim(xss(fields.seoDescription || '')),
                        topIMG,
                        updatedAt: new Date()
                    };
    
                    // Update the post
                    const updatedPost = await Post.findOneAndUpdate(
                        { pathName },
                        { $set: updateData },
                        { new: true }
                    );
                    console.log('updatedPost: ', updatedPost);
    
            const post_id = updatedPost._id;
            
            // 获取当前文章的分类和子分类
            const currentPost = await Post.findById(post_id)
                .populate('category')
                .populate('subcategory')
                .exec();

           // 处理主分类更新
            if (category) {
                // 检查分类是否已存在
                // 查询是否存在该主分类，需要等待数据库返回结果
            let categoryExist = await Category.findOne({ name: category }).exec();
            console.log('categoryExist: ', JSON.stringify(categoryExist));
                let existingCategoryInPost ;
                const cat = { catName: category, subcatName: subcategory };
                console.log('into if-category...')
                if (categoryExist) {
                    existingCategoryInPost = await Post.findOne({ category: categoryExist._id , _id: post_id}).exec();
                    console.log('existingCategoryInPost: ', JSON.stringify(existingCategoryInPost));
                    if(!existingCategoryInPost ){
                      console.log('into !existingCategoryInPost...')
                      await Post.findOneAndUpdate({ _id: post_id }, { $set: { category: categoryExist._id } }).exec();
                    }
                }else{
                    console.log('into category doesn"t Exist...')
                    await postProxy.saveCategory(
                        req,
                        res,
                        cat,
                        Category,
                        Post,
                        post_id,
                        'category'
                    );
                }
              

              // if(!existingCategory){
                    // 更新子分类

                //}
            }

            // 处理子分类更新
            if (subcategory) {
                // 检查子分类是否已存在
                const existingSubcategory = await Subcategory.findOne({ name: subcategory }).exec();
                const oldSubcategoryId = currentPost.subcategory?._id || null;
                
                // 只有当子分类不存在，或者子分类已更改时才需要更新
                if (!existingSubcategory || 
                    (oldSubcategoryId && existingSubcategory._id.toString() !== oldSubcategoryId.toString())) {
                    
                   let cat = { catName: category, subcatName: subcategory };
                    
                    // 更新子分类
                    await postProxy.saveCategory(
                        req,
                        res,
                        cat,
                        Subcategory,
                        Post,
                        post_id,
                        'subcategory'
                    );
                } else if (existingSubcategory) {
                    // 子分类已存在且与当前文章的子分类相同，无需更新
                }

                // // 如果存在父分类，确保子分类在父分类的子分类列表中
                // if (currentPost.category) {
                //     await Category.findByIdAndUpdate(
                //         currentPost.category._id,
                //         { $addToSet: { subcategories: subcategory } },
                //         { new: true }
                //     ).exec();
                // }
            }

                    req.flash('success', 'Post updated successfully');
                    return res.redirect(`/article/${updatedPost.pathName}`);
    
                } catch (error) {
                    logger.error('Error updating post:', error);
                    // Clean up any uploaded files if there was an error
                    if (files && files.topIMG && files.topIMG.path) {
                        try {
                            fs.unlinkSync(files.topIMG.path);
                        } catch (e) {
                            logger.error('Error removing uploaded file:', e);
                        }
                    }
                    req.flash('error', 'Error updating post: ' + error.message);
                    return res.redirect('back');
                }
            });
    
        } catch (error) {
            logger.error('Server error in postModify:', error);
            req.flash('error', 'Server error: ' + error.message);
            return res.redirect('back');
        }
      },
    //    getAllPosts: async function(req,res){
      
    //             const page = req.query.p ? parseInt(req.query.p) : 1;
    //             //let loginedUser;
    //             console.log('entering into the posts page');
    //             let query = {},sort = {};
    //             let user = req.user;
    //             let isAdmin;
    //             if(user){
    //                 user = user.processUser(user);
    //                 isAdmin = user.admin;
    //             }

    //             //查询并返回第 page 页的 10 篇文章
    //             postProxy.getTen(query,sort, page, (err, posts, count)=> {
    //                 if (err) {
    //                 console.log('some error with getting the 10 posts:'+ err);
    //                 //next(err);
    //                 posts = [];
    //                 } 

    //                logger.info('query'+ JSON.stringify(query) + JSON.stringify(posts));
    //                 res.render('post/posts', {
    //                     seo: {
    //                         title: 'All blog articles in Physiotherapy Equipment',
    //                         keywords: 'articles in Physiotherapy Equipment',
    //                         description: 'All blog articles in Physiotherapy Equipment from Minsheng Medical',
    //                     },
    //                     user: req.user ? req.user.processUser(req.user) : req.user,
    //                     //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
    //                     posts: posts,
    //                         page: page,
    //                         isAdmin,
    //                         isFirstPage: (page - 1) == 0,
    //                         isLastPage: ((page - 1) * 10 + posts.length) == count,
    //                         messages: {
    //                             error: req.flash('error'),
    //                             success: req.flash('success'),
    //                             info: req.flash('info'),
    //                         }, // get the user out of session and pass to template
    //                 }); 
    //             });	    




    //    },
 
    //  getTagsPost: (req,res)=>{
    //             const tag_id = req.params.tag_id;
    //             const page = req.query.p ? parseInt(req.query.p) : 1;
    //             //let loginedUser;
    //             console.log('entering into the tagpost');

    //             //查询并返回第 page 页的 10 篇文章
    //             postProxy.getTen(tag_id, page, (err, posts, count)=> {
    //             if (err) {
    //                 console.log('some error with getting the 10 posts:'+ err);
    //                 posts = [];
    //             } 
    //             console.log('tag posts for'+ tag_id + posts);                   
    //             res.render('post/tagPosts', {
    //                         title: 'specific tag page',
    //                         user: req.user ? req.user.processUser(req.user) : req.user,
    //                         //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
    //                         posts: posts,
    //                         page: page,
    //                         isFirstPage: (page - 1) == 0,
    //                         isLastPage: ((page - 1) * 10 + posts.length) == count,
    //                         messages: {
    //                             error: req.flash('error'),
    //                             success: req.flash('success'),
    //                             info: req.flash('info'),
    //                         }, // get the user out of session and pass to template
    //             }); 
    //             },'exist_tag_id');	           

    //  },

    //  getSearch: function(req,res){
    //         const page = req.query.p ? parseInt(req.query.p) : 1;
    //         //let loginedUser;
    //         console.log('entering into the serarchPost');           
    //         let keyword;
    //         if(req.query.keyword){
    //             keyword = req.query.keyword;
    //         }
           
    //        pattern = new RegExp(keyword, "i");
    //        console.log('keyword search for'+ keyword);
    //        postProxy.getTen(pattern, page, (err, posts, count)=> {
    //                 if (err) {
    //                     console.log('some error with getting the 10 posts for search page:'+ err);
    //                     posts = [];
    //                 } 
    //                 res.render('post/tagPosts', {
    //                         title: 'specific pages',
    //                         user: req.user ? req.user.processUser(req.user) : req.user,
    //                         //postUser: req.user ? (req.user._id == user_id ? loginedUser : theuser) : theuser,
    //                         posts: posts,
    //                         keyword: keyword,
    //                         page: page,
    //                         isFirstPage: (page - 1) == 0,
    //                         isLastPage: ((page - 1) * 10 + posts.length) == count,
    //                         messages: {
    //                             error: req.flash('error'),
    //                             success: req.flash('success'),
    //                             info: req.flash('info'),
    //                         }, // get the user out of session and pass to template
    //                 });                 
    //        },undefined,'exits_title',undefined);

    //  },
}