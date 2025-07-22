"use strict";
let moment = require('moment'),
     Product = require('../models/Product'),
     productProxy = require('../db_proxy/product'),
    User = require('../models/User'),
    // Comment = require('../models/ ProductComment'),
    // env = process.env.NODE_ENV || 'development',
    Category = require('../models/Category'),
    Subcategory = require('../models/Subcategory'),

    { IncomingForm }  = require('formidable'),
    config  = require('../common/get-config'),
    mailService  = require('../libs/mail')(config),
    logger = require('../libs/logger'),
    path = require('path'),
    sharp = require('sharp'),
    cheerio = require('cheerio'),
    fs = require('fs');
const Mail = require('nodemailer/lib/mailer');
    let seo = require('../config/seo');
    let util = require('../libs/utility');
    let mongoose = require('mongoose');
    let xss = require('xss');

module.exports = {
    postModify: async (req,res) => {
        try {
            const name_changed = req.params.name_changed;

            let uploadDir = config.uploadDir + 'products/thumbnail/'
            util.checkDir(uploadDir);
            const form =  new IncomingForm({
                multiples: true,
                maxFileSize: 5242880*2,  /**5 * 1024 * 1024 (5mb)**/
                keepExtensions: true,
                uploadDir: uploadDir,
                allowEmptyFiles: false,
                minFileSize: 0,
                filename: function(name, ext, part){
                    // Skip saving if the user didn't select a file (no originalFilename)
                    if (!part.originalFilename || part.originalFilename.trim().length === 0) {
                        /*
                         Returning an empty string instead of undefined so that
                         path.join(uploadDir, '') still returns a valid string and
                         avoids the `ERR_INVALID_ARG_TYPE` error. The resulting
                         zero-byte file will be ignored later in the controller
                         when we build the `imageUrls` array.
                        */
                        return undefined;
                    }else{
                        const timestamp = new Date().getTime();  
                        const seconds = Math.floor(timestamp / 1000);
                        name = util.urlBeautify(name)
                        return `${seconds}-${name}${ext}`;  
                    }
                },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
            });
    
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    logger.error('Error parsing form data:', err);
                    req.flash('error', 'Error processing form data');
                    cleanupUploadedFiles(files);
                    return res.redirect('back');
                }
                try {
                    // Find the product to update
                    const product = await Product.findOne({ name_changed });
                    if (!product) {
                        req.flash('error', 'Product not found');
                        return res.redirect('back');
                    }
                    // Process categories and subcategories
                    const categories = Array.isArray(fields['category[]']) 
                        ? fields['category[]'].map(cat => util.trim(xss(cat))).filter(Boolean)
                        : fields['category[]'] 
                            ? [util.trim(xss(fields['category[]']))].filter(Boolean)
                            : [];
                    const subcategories = Array.isArray(fields['subcategory[]'])
                        ? fields['subcategory[]'].map(sub => util.trim(xss(sub))).filter(Boolean)
                        : fields['subcategory[]']
                            ? [util.trim(xss(fields['subcategory[]']))].filter(Boolean)
                            : [];
                    // Validate categories and subcategories
                    if (categories.length !== subcategories.length) {
                        req.flash('error', 'The number of categories must match the number of subcategories');
                        logger.error("The number of categories must match the number of subcategories");
                        cleanupUploadedFiles(files);
                        return res.redirect('back');
                    }
    
                    // Process images
                    let imageUrls = [];

                    // helper to cleanup temp uploaded files on error
                    const cleanupUploadedFiles = (filesObj) => {
                        if (!filesObj) return;
                        Object.values(filesObj).forEach(f => {
                            const arr = Array.isArray(f) ? f : [f];
                            arr.forEach(file => {
                                if (file && file.filepath && fs.existsSync(file.filepath)) {
                                    try {
                                        fs.unlinkSync(file.filepath);
                                    } catch (e) {
                                        logger.error('Error removing temp file:', e);
                                    }
                                }
                            });
                        });
                    };
                    logger.info(`fields: ${JSON.stringify(fields)}`)
                    

                    // Keep existing images if they exist and not removed
                    if (fields['existingImages[]'] && fields['existingImages[]'].length) {
                        const existingImages = Array.isArray(fields['existingImages[]'])
                            ? fields['existingImages[]']
                            : [fields['existingImages[]']];
                        imageUrls = existingImages;
                    }
                    logger.info(`files: ${JSON.stringify(files)}; files.topIMG: ${JSON.stringify(files.topIMG)}`)
                    // Process new uploaded images

                    // Process new uploaded images if any
                    if (files && files.topIMG && files.topIMG[0].size !== 0) {
                        // 清空现有图片，因为用户上传了新图片
                        // imageUrls = [];
                        let images =  Array.isArray(files.topIMG) ? files.topIMG : [files.topIMG];//array
                        
                        // 处理新上传的图片
                        for (let i = 0; i < images.length; i++) {
                            if (images[i] && images[i].newFilename) {
                                const filename = images[i].newFilename.trim();
                                if (filename) {
                                    imageUrls.push(filename);
                                }
                            }
                        }
                        // 去重，保持顺序
                        imageUrls = imageUrls.filter((v, i, arr) => arr.indexOf(v) === i);
                        logger.info(`New images uploaded: ${JSON.stringify(imageUrls)}`);
                    } else if (imageUrls.length === 0) {
                        // 如果没有新图片且没有现有图片，保留原始图片
                        imageUrls = [...product.imgs];
                    }
                    // Process pricing variants
                    // 1. 首先收集所有 pricing 的索引
                    const pricingIndices = new Set();
                    Object.keys(fields).forEach(key => {
                        const match = key.match(/^pricing\[(\d+)\]\[/);
                        if (match) {
                            pricingIndices.add(parseInt(match[1]));
                        }
                    });
                    
                    // 2. 处理每个 pricing 项
                    let pricing = Array.from(pricingIndices).sort().map(index => {
                        const prefix = `pricing[${index}]`;
                        return {
                            price: parseFloat(util.trim(xss(fields[`${prefix}[price]`]?.[0] || '0'))) || 0,
                            stock: parseInt(util.trim(xss(fields[`${prefix}[stock]`]?.[0] || '0'))) || 0,
                            weight: parseFloat(util.trim(xss(fields[`${prefix}[weight]`]?.[0] || '0'))) || 0,
                            sku: util.trim(xss(fields[`${prefix}[sku]`]?.[0] || '')),
                            color: util.trim(xss(fields[`${prefix}[color]`]?.[0] || ''))
                        };
                    }).filter(p => p.price > 0);  // 过滤掉无效价格
                    logger.info(`below pricing management`)

                    // 价格数据处理
                    let priceRange,startingPrice;
                    if (pricing.length > 0) {
                        const prices = pricing.map(p => p.price);
                        logger.info(`typeof prices: ${typeof prices} prices: ${JSON.stringify(prices)}`);
                        priceRange = {
                            min: Math.min(...prices),
                            max: Math.max(...prices),
                            hasVariants: pricing.length > 1
                        };
                        startingPrice = Math.min(...prices);
                    } else {
                        priceRange = {
                            min: 0,
                            max: 0,
                            hasVariants: false
                        };
                        startingPrice = 0;
                    }
                    let content = util.trim(xss(fields.content ? util.removeBlankFromText(fields.content[0]) : ''));
                    // 在处理content的地方，添加以下代码
                    if (content) {
                        const $ = cheerio.load(content, { decodeEntities: false });
                        const $tables = $('table');
                        if ($tables.length > 0) {
                            // 为每个表格添加包裹容器
                            $tables.each(function() {
                                const $table = $(this);
                                // 添加表格类
                                $table.addClass('table table-bordered');
                                // 设置表格样式
                                $table.css({
                                    'text-align': 'center',
                                    'vertical-align': 'middle',
                                    'width': '100%',
                                    'margin-bottom': '0',
                                    'table-layout': 'auto'
                                });
                                // 设置表格单元格内边距
                                $table.find('>:not(caption)>*>*').css({
                                    'padding': '0.8rem 0.8rem'
                                });
                                // 移除段落底部边距
                                $table.find('td p').css({ 
                                    'margin-bottom': '0rem'
                                });
                                
                                // 创建包裹容器
                                const $wrapper = $('<div class="table-responsive"></div>').css({
                                    'max-height': '500px',
                                    'overflow-y': 'auto',
                                    'margin-bottom': '1rem',
                                    'border': '1px solid #dee2e6',
                                    'border-radius': '0.25rem'
                                });
                                
                                // 将表格放入容器中
                                $table.wrap($wrapper);
                            });
                            
                            content = $.html();
                        }
                    }        

                    // Update product data
                    const updateData = {
                        name: util.trim(xss(fields.name ? fields.name[0] : '')),
                        name_changed: util.trim(xss(fields.name_changed ? fields.name_changed[0] : '')),
                        content,
                        intro: util.trim(xss(fields.intro ? fields.intro[0] : '')),
                        manufacturer: util.trim(xss(fields.manufacturer ? fields.manufacturer[0] : '')),
                        seoTitle: util.trim(xss(fields.seoTitle ? fields.seoTitle[0] : '')),
                        seoKeyword: util.trim(xss(fields.seoKeyword ? fields.seoKeyword[0] : '')),
                        seoDescription: util.trim(xss(fields.seoDescription ? fields.seoDescription[0] : '')),
                        imgs: imageUrls,
                        categories: [], // 清空原有分类
                        subcategories: [], // 清空原有子分类
                        pricing,
                        priceRange,startingPrice,
                        updatedAt: new Date()
                    };



                    // Update the product
                    const updatedProduct = await Product.findOneAndUpdate(
                        { name_changed },
                        { $set: updateData },
                        { new: true }
                    );
    
                    // Update categories and subcategories
                    if (categories.length > 0) {
                        // Remove existing category associations
                        // Add new category associations
                        for (let i = 0; i < categories.length; i++) {
                            const cat = {
                                catName: categories[i],
                                subcatName: subcategories[i]
                            };
                            logger.info(`in for loop: ${categories[i]}`)
                            await productProxy.saveCategory(req, res, cat, Category, Product, updatedProduct._id, 'category');
                            await productProxy.saveCategory(req, res, cat, Subcategory, Product, updatedProduct._id, 'subcategory');
                        }
                    }
    
                    req.flash('success', 'Product updated successfully');
                    res.redirect(`/product/${updatedProduct.name_changed}`);
    
                } catch (error) {
                    logger.error('Error updating product:', error);
                    req.flash('error', 'Error updating product: ' + error.message);
                    cleanupUploadedFiles(files);
                    res.redirect('back');
                }
            });
    
        } catch (error) {
            logger.error('Server error in postModify:', error);
            req.flash('error', 'Server error: ' + error.message);
            res.redirect('back');
        }
    },
    getModify: async (req,res) => {
        let name_changed = req.params.name_changed;
        let product = await Product.findOne({name_changed: name_changed}).populate('categories').populate('subcategories').exec();
        logger.info(`product: ${JSON.stringify(product)}`);
        res.render('form/modifyProduct', {
            product,
            seo: {
                title: `Modify an Product`,
                keywords: `modify an Product`,
                description: `Modify an Product!`,
            },
            env:{
                cspNonce: res.locals.cspNonce
            },
            user: req.user.processUser(req.user),
            messages: {
                error: req.flash('error'),
                success: req.flash('success'),
                info: req.flash('info'),
            }            
        });
    },
    makeProduct: async (req,res) => {
         res.render('form/submitProduct', {
              seo: {
                  title: `Sumbit an Product`,
                  keywords: `submit an Product`,
                  description: `Submit an Product! `,
              },
              env:{
                  cspNonce: res.locals.cspNonce
              },
               user: req.user.processUser(req.user),
               messages: {
                     error: req.flash('error'),
                     success: req.flash('success'),
                     info: req.flash('info'),
               }            

         });
    },
    postProductForMultiIMG: async (req,res)=>{
    let user = req.user;
    let isAdmin = false;
    if(user){
        user = user.processUser(user);
        isAdmin = user.admin;
    }
    let product = new Product();

    // Productimage
    let uploadDir = config.uploadDir + 'products/thumbnail/'
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

    // // Add image compression handler
    // form.on('file', async (field, file) => {
    //     if (file.mimetype.startsWith('image/')) {
    //         try {
    //             let name = util.urlBeautify(file.originalFilename.split('.')[0]);
    //             const timestamp = new Date().getTime();  
    //             const seconds = Math.floor(timestamp / 1000);
    //             name = util.urlBeautify(name)
    //             return `${seconds}-${name}${ext}`;   
    //           //  const randomString = Math.random().toString(36).substring(2, 8);
    //             // const timestamp = new Date().getTime();
    //             // //const seconds = Math.floor(timestamp / 1000);
    //             // const name = util.urlBeautify(file.originalFilename.split('.')[0]);
    //             // const ext = path.extname(file.originalFilename);
    //             // const newFilename = `${timestamp}-${name}${ext}`;//`${seconds}-${name}${ext}`;
    //             // const newFilepath = path.join(path.dirname(file.filepath), newFilename);
                
    //             // await sharp(file.filepath)
    //             //     .resize({ width: 800, height: 600, fit: 'inside' })
    //             //     .jpeg({ quality: 65 })
    //             //     .toFile(newFilepath);
                
    //             // fs.unlinkSync(file.filepath); // 删除原文件
    //             // file.filepath = newFilepath; // 更新文件路径
    //             // file.newFilename = newFilename; // 更新文件名
    //         } catch (error) {
    //             logger.error('Error compressing image:', error);
    //         }
    //     }
    // });


    form.parse(req,(err,fields,files)=>{
        //let filename = fields.imgName;
       // console.log(`files: ${JSON.stringify(files)},fields: ${JSON.stringify(fields)}`)
        //let filename = file.topIMG.newFilename.trim();
        logger.info(`files: ${JSON.stringify(files)},fields: ${JSON.stringify(fields)}`)
        product.author = user._id;
        let images = files.topIMG;//array
        let imgs = [];
        for(let i=0;i<images.length;i++){
            let filename = images[i].newFilename.trim();
            imgs.push(filename)
        }
        product.imgs = imgs;


        // 1. 首先收集所有 pricing 的索引
        const pricingIndices = new Set();
        Object.keys(fields).forEach(key => {
            const match = key.match(/^pricing\[(\d+)\]\[/);
            if (match) {
                pricingIndices.add(parseInt(match[1]));
            }
        });

        // 2. 处理每个 pricing 项
        let pricing = Array.from(pricingIndices).sort().map(index => {
            const prefix = `pricing[${index}]`;
            return {
                price: parseFloat(util.trim(xss(fields[`${prefix}[price]`]?.[0] || '0'))) || 0,
                stock: parseInt(util.trim(xss(fields[`${prefix}[stock]`]?.[0] || '0'))) || 0,
                weight: parseFloat(util.trim(xss(fields[`${prefix}[weight]`]?.[0] || '0'))) || 0,
                sku: util.trim(xss(fields[`${prefix}[sku]`]?.[0] || '')),
                color: util.trim(xss(fields[`${prefix}[color]`]?.[0] || ''))
            };
        }).filter(p => p.price > 0);  // 过滤掉无效价格

       let name = util.trim(xss(fields.name ? fields.name[0] : '')),
           content = util.trim(xss(fields.content ? util.removeBlankFromText(fields.content[0]) : '')),
           intro = util.trim(xss(fields.intro ? fields.intro[0] : '')),
           categories =  (fields["category[]"] || []).map(cate => util.trim(xss(cate))).filter(cate => cate.length > 0),
           subcategories =  (fields["subcategory[]"] || []).map(subca => util.trim(xss(subca))).filter(subca => subca.length > 0),
           manufacturer = util.trim(xss(fields.manufacturer ? fields.manufacturer[0] : '')),

           seoTitle = util.trim(xss(fields.seoTitle ? fields.seoTitle[0] : '')),
           seoKeyword = util.trim(xss(fields.seoKeyword ? fields.seoKeyword[0] : '')),
           seoDescription = util.trim(xss(fields.seoDescription ? fields.seoDescription[0] : ''));
      

           // 在处理content的地方，添加以下代码
           if (content) {
            const $ = cheerio.load(content, { decodeEntities: false });
            const $tables = $('table');
            if ($tables.length > 0) {
                // 为每个表格添加包裹容器
                $tables.each(function() {
                    const $table = $(this);
                    // 添加表格类
                    $table.addClass('table table-bordered');
                    // 设置表格样式
                    $table.css({
                        'text-align': 'center',
                        'vertical-align': 'middle',
                        'width': '100%',
                        'margin-bottom': '0',
                        'table-layout': 'auto'
                    });
                    // 设置表格单元格内边距
                    $table.find('>:not(caption)>*>*').css({
                        'padding': '0.8rem 0.8rem'
                    });
                    // 移除段落底部边距
                    $table.find('td p').css({ 
                        'margin-bottom': '0rem'
                    });
                    
                    // 创建包裹容器
                    const $wrapper = $('<div class="table-responsive"></div>').css({
                        'max-height': '500px',
                        'overflow-y': 'auto',
                        'margin-bottom': '1rem',
                        'border': '1px solid #dee2e6',
                        'border-radius': '0.25rem'
                    });
                    
                    // 将表格放入容器中
                    $table.wrap($wrapper);
                });
                
                content = $.html();
            }
        } 

        if (categories.length !== subcategories.length) {
        // Handle the error case where the lengths do not match
        req.flash('error', 'The number of categories must match the number of subcategories.');
        logger.error("The number of categories must match the number of subcategories.");
        return res.redirect('back');
        }
        product.name = name;
        product.name_changed = util.urlBeautify(name);
        product.user_id = user._id;
        product.content = content;
        product.intro = intro;
        product.seoKeyword = seoKeyword;
        product.seoTitle = seoTitle;
        product.seoDescription = seoDescription;
        product.manufacturer = manufacturer;

        logger.info(`typeof pricing after mapping: ${typeof pricing} pricing: ${JSON.stringify(pricing)}`);

        // 价格数据处理
        if (pricing.length > 0) {
            const prices = pricing.map(p => p.price);
            logger.info(`typeof prices: ${typeof prices} prices: ${JSON.stringify(prices)}`);
            product.priceRange = {
                min: Math.min(...prices),
                max: Math.max(...prices),
                hasVariants: pricing.length > 1
            };
            product.startingPrice = Math.min(...prices);
        } else {
            product.priceRange = {
                min: 0,
                max: 0,
                hasVariants: false
            };
            product.startingPrice = 0;
        }
        product.pricing = pricing;
        logger.info(`product : ${JSON.stringify(product)}`)
         product.save(async (err,product)=>{
              if(err){
                    logger.error(' Productsave error: ' +  err);
                    req.flash('error',`there is some errors when save the post ${err}`);
                    res.redirect('back');
               }else{
                    logger.info(`product.imgs: ${JSON.stringify(product.imgs)}`)
                    let product_id = product._id;
                    // let cat = {};
                    // cat.catName= category;  cat.subcatName = subcategory;

                    for (let i = 0; i < categories.length; i++) {
                        const cat = {
                            catName: categories[i],
                            subcatName: subcategories[i] // Assuming subcategories are in the same order
                        };
                        await productProxy.saveCategory(req, res, cat, Category, Product, product_id, 'category');
                        await productProxy.saveCategory(req, res, cat, Subcategory,Product,product_id,'subcategory');
                    }
                    logger.info(`your product data saved successfully: ${product._id}`);
                    req.flash('success','Your product data saved successfully');
                    res.redirect(`/product/` + product.name_changed);
              }
        });

    });


    },
    showProduct: async (req,res) => {
        let name = req.params.name;  
        console.log(`req.getIpInfo: ${JSON.stringify(req.ipInfo)}`);
        // {"ip":"157.90.182.28","range":[2639921152,2639986687],"country":"US","region":"","eu":"0","timezone":"America/Chicago","city":"","ll":[37.751,-97.822],"metro":0,"area":1000}
        console.log('name is '+name); 
        await productProxy.getProductByName(req,res,name,'product/product'); 
        // for demo only, delte
        // res.render('product/product', {
        //     data: {      
        //     },
        //     product,
        //     seo: {
        //         title: seo.home.title,
        //         keywords: seo.home.keywords,
        //         description: seo.home.description,
        //     },
        //     env:{
        //         cspNonce: res.locals.cspNonce
        //     },
        //     user: req.user ? req.user.processUser(req.user) : req.user,
        //     isAdmin: isAdmin,
        //     messages: {
        //         error: req.flash('error'),
        //         success: req.flash('success'),
        //         info: req.flash('info'),
        //     }, // get the user out of session and pass to template
        // }); //render 
        
        //productProxy.getProductByName(req,res,name,'product/product'); 
    },
//     category: async (req, res)=>{//subcategory
//       let user = req.user;
//       let isAdmin = false;
//       if(user){
//           user = user.processUser(user);
//           isAdmin = user.admin;
//       }
//       let p = req.query.p;
//       const page = p ? parseInt(p) : 1;

//       let cat = req.params.category;
//       cat = util.unslugify(cat);
//       logger.info('cat is '+ cat);   
      
//       let theCat  = await Subcategory.findOne({name: cat}).exec();
//       //if name doesn't exist in the db
//       if(!theCat){
//        req.flash('error','Name not existing or is null/undefined');
//        return  res.redirect('back'); 
//       }
//       theCat = theCat.processCategory(theCat);
//       let id = theCat._id;
//       let name = theCat.name;

//       let query = {subcategory: id, hidden: false};
//       let sort = {created_at: -1};//时间顺序排，并还可以提供getTen数据唯一性

//     //   let products = await Product.find({subcategory: id, hidden: false}).exec();
//     //   products = await productProxy.modifySitesAsync(products);
//      let {products, count, isLastPage, error} = await productProxy.getTenAsync(query,sort,page);

//     if(p){
//             let data = {products, count, isLastPage, error};
//             // 调用 getTenAsync 函数获取文章数据
//             res.json(data); // 将数据以 JSON 格式发送回客户端
//     }else{
//         res.render('home/proCategory', {
//             theCat,
//             products,
//             seo: {
//                 title: `Best AI Devices in ${name} 2025 | CogList`,
//                 keywords: `${name},best AI devices in ${name}`,
//                 description: theCat.intro ? util.truncateString(theCat.intro, 160,'...'): `Discover top smart products in ${name} 2025!`,
//             },
//             env:{
//                 cspNonce: res.locals.cspNonce
//             },
//             page: page,
//             isFirstPage: (page - 1) == 0,
//             isLastPage: ((page - 1) * 10 + products.length) == count,
//             user: req.user ? req.user.processUser(req.user) : req.user,
//             isAdmin: isAdmin,
    
//             // csrfToken: req.csrfToken(),
//             messages: {
//                 error: req.flash('error'),
//                 success: req.flash('success'),
//                 info: req.flash('info'),
//             }, // get the user out of session and pass to template
//          }); //render 
//     }







//     //   console.log('products in category:' +  JSON.stringify(products))

//     //   res.render('home/proCategory', {
//     //       theCat,
//     //       products,
//     //       seo: {
//     //           title: `Best AI Devices in ${name} 2025 | CogList`,
//     //           keywords: `${name},best AI gadgets in ${name}`,
//     //           description: theCat.intro ? util.truncateString(theCat.intro, 160,'...'): `Discover top smart products in ${name} 2025!`,
//     //       },
//     //       env:{
//     //           cspNonce: res.locals.cspNonce
//     //       },
//     //       page: page,
//     //       isFirstPage: (page - 1) == 0,
//     //       isLastPage: ((page - 1) * 10 + products.length) == count,
//     //       user: req.user ? req.user.processUser(req.user) : req.user,
//     //       isAdmin: isAdmin,

//     //     // csrfToken: req.csrfToken(),
//     //       messages: {
//     //           error: req.flash('error'),
//     //           success: req.flash('success'),
//     //           info: req.flash('info'),
//     //       }, // get the user out of session and pass to template
//     //   }); //render 



//     },
//    showTag: async (req,res) => {
//         let user = req.user;
//         let isAdmin = false;
//         if(user){
//             user = user.processUser(user);
//             isAdmin = user.admin;
//         }
  
//        let tag = req.params.tag;
//        console.log('tag is '+ tag);   
       
//        let theTag  = await Tag.findOne({name: tag}).populate('posts').exec();
//        console.log(`theTag: ${JSON.stringify(theTag)}`);
//       // tags.map(function(v){
//       //   return v.posts = productProxy.modifySitesAsync(v.posts)
//       // })
//       if(theTag){
//         theTag = theTag.processTag(theTag) ;
//         let tagName =  util.formatStr(theTag.name);
  
//         theTag.intro  = theTag.intro ? theTag.intro  : `${tagName} AI Tools for Your Everyday Needs!`;
        
//           theTag.posts.map(function(v){
//             return v.tagsArray = util.stringToArray(v.tagsString)
//            // return v.tagsArray = v.tagsString.split(',');
//           })
//           //console.log(`theTag.post: ${JSON.stringify(theTag.posts)}`)  
  
//           res.render('home/tag', {
//               theTag,
//               seo: {
//                   title: `Best ${tagName} Projects 2023 | CogList`,
//                   keywords: `${tagName},best ${tagName},top ${tagName}`,
//                   description: `${theTag.intro ? util.truncateString(theTag.intro,170,'...'): `Discover top premium or free ${tagName} projects in CogList!`}`,
//               },
//               env:{
//                   cspNonce: res.locals.cspNonce
//               },
              
    
//               user: req.user ? req.user.processUser(req.user) : req.user,
//               isAdmin: isAdmin,
    
//             // csrfToken: req.csrfToken(),
//               messages: {
//                   error: req.flash('error'),
//                   success: req.flash('success'),
//                   info: req.flash('info'),
//               }, // get the user out of session and pass to template
//           }); //render 
//       }else{
//         req.flash("error","Your tag requested doesn't exist!");
//         res.redirect('back');
//       }
//   },
  

  //   submitSite: async (req,res)=>{

  //       const user = req.user;
  //       let site;
  //           //   name = req.body.name,
  //           //   url = req.body.url,
  //           //  // tags = req.body.tags,
  //           //   category = req.body.category,
  //           //   content = req.body.content,

  //           // body = req.body,

           

  //           let uploadDir = config.uploadDir + 'site/';
  //           utils.checkDir(config.uploadDir);
  //           utils.checkDir(uploadDir);
  //           const form =  new IncomingForm({
  //               multiples: false,
  //               maxFileSize: 5242880,  /**5 * 1024 * 1024 (5mb)**/
  //               keepExtensions: false,
  //               uploadDir: uploadDir,
  //               allowEmptyFiles: false,
  //               minFileSize: 1,/* 1 byte*/
  //               filename: function(name, ext, part, form){
  //                   //name = new Date().toDateString + filename
  //                   return name;
  //               },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
  //           });

  //           form.parse(req,(err,fields,file)=>{
  //               //let filename = fields.imgName;
  //               let category = fields.category;
  //               console.log(`file: ${JSON.stringify(file)}`)

  //               if(category == 'Wallets'){
  //                   site = new Wallet();
  //               }else if(category == 'Exchanges'){
  //                   site = new Product();
  //               }else{
  //                 res.redirect('back');
  //               }

  //               //**common parts**
                 
  //               //let filename = file.img.newFilename;
  //               site.author = user._id;
  //               // site.user_id = user._id;
  //               site.name = fields.name;
  //               if(util.blankExit(fields.name)){
  //                 site.name_changed = fields.name.split(' ').join('-');
  //               }else{
  //                 site.name_changed = fields.name;
  //               }
  //               site.content = fields.content;
  //               site.url = fields.url;
  //               site.user_id = user._id;
        
  //               //site.img = filename;
                
  //               site.best_for = fields.best_for;
  //               site.decentralized = fields.decentralized;
  //               site.one = fields.one;
  //               site.tagsString = fields.tagsString;
  //               site.category = fields.category;//for link query ?
  //               site.blockchain = fields.blockchain;

  //               let pros = fields.pros;
  //               let cons =fields.cons;
  //               site.pros = pros.split(';');
  //               site.cons = cons.split(';');
  //               if(fields.kyc == 'yes'){
  //                 site.kyc_required = true;
  //               }else if(fields.kyc == 'no'){
  //                 site.kyc_required = false;
  //               }
  //               site.base = fields.base;
  //               site.active_since = fields.active_since;
  //               if(fields.hacked == 'yes'){
  //                site.hacked = true;
  //               }else if(fields.hacked == 'no'){
  //                site.hacked = false;
  //               }
  //               site.hacked_history = fields.hacked_history;

  //               site.twitter = fields.twitter;
  //               site.telegram = fields.telegram;
  //               site.discord = fields.discord;

  //               if(fields.us_allowed == 'yes'){
  //                 site.us_allowed = true;
  //                }else if(fields.us_allowed == 'no'){
  //                 site.us_allowed = false;
  //                }


  //               /**crypto wallet**/
  //               site.currencies = fields.currencies;
  //               site.currencies_num = fields.currencies_num;
  //               if(fields.code_open_source =='yes'){
  //                 site.code_open_source = true;
  //               }else if(fields.code_open_source =='no'){
  //                 site.code_open_source = false;
  //               }


  //               //site.wallet_type = fields.wallet_type;
  //               site.compatibilities = fields.compatibilities;  
  //               site.transferable = fields.transferable; 
  //               if(fields.swap =='yes'){
  //                 site.swap = true;
  //               }else if(fields.swap =='no'){
  //                 site.swap = false;
  //               }
  //               if(fields.control_private_keys =='yes'){
  //                 site.control_private_keys  = true;
  //               }else if(fields.control_private_keys  =='no'){
  //                 site.control_private_keys  = false;
  //               }


  //               /**crypto exchanges**/
  //               site.price = fields.price;
  //               site.taker_fee = fields.taker_fee;
  //               site.maker_fee = fields.maker_fee;
  //               site.withdrawn_fee = fields.withdrawn_fee;


  //                if(fields.regulated == 'yes'){
  //                 site.regulated = true;
  //                }else if(fields.regulated == 'no'){
  //                 site.regulated = false;
  //                }
  //                site.spot0_taker_fee = fields.spot0_taker_fee;
  //                site.spot0_maker_fee = fields.spot0_maker_fee;
  //                site.future0_taker_fee = fields.spot0_taker_fee;
  //                site.future0_maker_fee = fields.spot0_maker_fee;   

                 
  //                let wire = fields.wire;

  //                site.save((err,site)=>{
  //                     if(err){
  //                           logger.error('site save error: ' +  err);
  //                           req.flash('error',`there is some errors when save the post ${err}`);
  //                           res.redirect('back');
  //                      }else{
  //                           //new tag and save post
                            

  //                           if(site){
  //                               let tagS = fields.tagsString;
  //                               if(category == 'Exchanges'){
  //                                 tagProxy.saveSingle(site._id, tagS, Site, SiteTag);                                    
  //                               }else if(category == 'Wallets')
  //                               tagProxy.saveSingle(site._id, tagS, Wallet, WalletTag);  
  //                             }else{
  //                                 logger.debug('no data')
  //                             }







  //                           // prosArray.forEach((v, i, a) => {
  //                           //     Site.updateOne({
  //                           //         id: site._id
  //                           //       }, {
  //                           //         '$push': {
  //                           //             pros: v,
  //                           //         }
  //                           //       }, function(err, data) {
  //                           //         if (err) {
  //                           //           logger.error(`update pro and con error: ${err}`);
  //                           //           res.redirect('back');
  //                           //         } else {


  //                           //         }
  //                           //       });                    
  //                           // });


  //                           // consArray.forEach((v, i, a) => {
  //                           //     Site.updateOne({
  //                           //         id: site._id
  //                           //       }, {
  //                           //         '$push': {
  //                           //             cons: v,
  //                           //         }
  //                           //       }, function(err, data) {
  //                           //         if (err) {
  //                           //           logger.error(`update pro and con error: ${err}`);
  //                           //           res.redirect('back');
  //                           //         } else {


  //                           //         }
  //                           //       });                    
  //                           // })

              
  //                           logger.info(`your site date saved successfully: ${site._id}`);
  //                           req.flash('success','Your site data saved successfully');
  //                           res.redirect(`/wallet/${site.name_changed}` );


  //                     }
  //               });

  //           });








   
  //  },



    // showPost: (req,res)=>{
    //     const title = req.params.name;
    //     console.log('name is '+name);
    //     productProxy.getSiteByName(req,res,title,'site/showOne');      
    // },
  

  
    //   getPersonalPosts: (req,res)=>{
    //               const user_id = req.params.user_id;                                  
    //               postProxy.getPostsByUserId(req,res,user_id,'post/personalPosts');
    //    },



    //    getAllPosts: async function(req,res){
      
    //             const page = req.query.p ? parseInt(req.query.p) : 1;
    //             //let loginedUser;
    //             console.log('entering into the posts page');
    //             let query = {},sort = {};
               

    //             //查询并返回第 page 页的 10 篇文章
    //             postProxy.getTen(query,sort, page, (err, posts, count)=> {
    //                 if (err) {
    //                 console.log('some error with getting the 10 posts:'+ err);
    //                 //next(err);
    //                 posts = [];
    //                 } 

    //                logger.info('query'+ JSON.stringify(query) + JSON.stringify(posts));
                    
    //                 res.render('post/posts', {
    //                         title: 'All the Articles for Web3',
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
    //                 if (err) {
    //                 console.log('some error with getting the 10 posts:'+ err);
    //                 //next(err);
    //                 posts = [];
    //                 } 
    //                 // if(req.user){
    //                 //     loginedUser = req.user.processUser(req.user);
    //                 // }
    //                 //userProxy.getUserById(user_id, theuser=>{
    //                 console.log('tag posts for'+ tag_id +posts);
                    
    //                 res.render('post/tagPosts', {
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
    //                 }); 


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