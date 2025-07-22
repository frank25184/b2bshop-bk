"use strict";
const User    = require('../models/User'),
    //   Best = require('../models/Best'),
    //   BestTag = require('../models/BestTag'),


      Post = require('../models/Post'),
      Category = require('../models/PostCategory'),
      Tag = require('../models/PostTag'),
      Comment = require('../models/Comment'),
      userProxy = require('../db_proxy/user'),
      moment = require('moment'),    
      asyncErrHandle = require('../common/asyncErrHandle'),
      logger = require('../libs/logger'),
      utility = require('../libs/utility');                              


module.exports = {
        /**
         * for articles
         * @id  post id  for article id
         * @tags String or Array: "exchange,centralized",or ["a","b"]
         * @PostModel Model
         * @PostmodelTag Tag
         * **/
        saveSingle:async (id,tags, PostModel,PostModelTag, str, category)=>{
            if(!category){category=''}
              
            let tagsArray;
          //  logger.info(`tagsArray in tags saving: ${JSON.stringify(tagsArray)}`);
          function stringToArray(tags) {
            if (tags.includes(",")) {
              return tags.split(",");
            } else {
              return [tags];
            }
          }

            if(Array.isArray(tags)){
                tagsArray = tags;
            }else{
                tagsArray = stringToArray(tags)
            }

            function insertTagId(_id){
                PostModel.findById(id, (err, data) => {
                    if(err){
                        logger.error(`error in Postmodel.FindById: ${err}`);
                        throw new Error(err);
                    }
                    if(data){
                        PostModel.findOneAndUpdate({ '_id': id }, { $push: { 'tags': _id } }, { new: true }, (err, data) => {
                            if (err) {
                                console.log(err);
                                throw new Error(err);
                                //next(err);
                            } 
                            if(data){
                                console.log('Postmodel.findOneAndUpdateTag for tags array is' + JSON.stringify(data));
                               // return;
                            }else{
                                logger.error(`no data from PostModel.findOneAndUpdate. data: ${JSON.stringify(data)}`);
                                
                            }
                            // else {
                            //     //res.redirect('/post/show/'+ post.title);
                            //     console.log('Postmodel.findOneAndUpdateTag for tags array is' + best);
                            //    // return;
                            // }
                        });
                    }else{
                        logger.error(`no data from PostModel.findById. data: ${JSON.stringify(data)}`);
                    }

        
                });            
            }


            async function isCaIdExistsInCategories(tagId) {
                try {
                  const doc = await Category.findOne({ tags: tagId }, { _id: 1 });
                  return !!doc; // 使用!!运算符将文档转换为布尔值
                } catch (error) {
                  console.error(error);
                  return false;
                }
            }

           async function createCategory(tagId){
                let ca = await Category.findOne({name: category}).exec();
                    if(ca && ca.name){

                      //判定tags是否重复
                      let caExist =   isCaIdExistsInCategories(tagId);
                      if(caExist){
                        // await Category.find({ posts: { $in: posts_id_arr } }).exec();
                        let categ = await Category.findOne({ '_id': ca._id }).exec();
                        if(categ){
                            let posts  = categ.posts;//an array of id 
                            let idExist = posts.includes(id);
                            if(!idExist){
                                Category.findOneAndUpdate({ '_id': ca._id }, {$push: {'posts': id } ,$inc: { 'postsCount': 1 }}).exec();  
                            }
                        }
                      }else{
                        Category.findOneAndUpdate({ '_id': ca._id }, {$push: { 'tags': tagId, 'posts': id } ,$inc: { 'postsCount': 1,'tagsCount': 1  }}).exec();
                      }
                      PostModel.findOneAndUpdate({"_id": id }, {category: ca._id}).exec();

                    }else{
                        //save category 
                        let cate = new Category();
                        cate.name = category;
                        cate.name_changed = utility.urlBeautify(category);
                        
                        cate.tags = [tagId];
                        cate.posts = [id];
                        cate.postsCount = 1;
                        cate.tagsCount = 1;

                        cate.save(function(err, data){
                            PostModel.findOneAndUpdate({"_id": id }, {category: data._id}).exec();
                        });
                    }
                
           }



            //let tagString = tag.name;
            for(let i=0; i<tagsArray.length;i++) {
                //let count;
                logger.info('into tagsArray if loop...')
                   // logger.info('into tagsArray foreach function async function loop...');
                   let v = tagsArray[i].trim();
                   v = v.toLowerCase();

                      // let atag = await PostModelTag.findOne({ name: v }).exec();
                      let atag = await PostModelTag.findOne({ name: v }).exec();
                        logger.info('utility.ObjectIsEmpty(atag): '+utility.ObjectIsEmpty(atag))
                        // if(err){
                        //     logger.error(`error in PostmodelTag.findOne: ${err}`);
                        //     throw new Error(err);
                        // }
                        //utility.ObjectIsEmpty(atag) == false
                        console.log(`atag type: ${typeof(atag)};  atag: ${JSON.stringify(atag)}; atag: atag==false: ${atag==false}`)
                        if (atag) {  //already exist
                            logger.debug('atag exist...'); 
                            let updatedTag = await PostModelTag.findOneAndUpdate({ name: v }, { "$push": { posts: id },$inc: { 'count': 1 }}, {
                                 new: true 
                                 // set the new option to true to return the document after update was applied.
                            }).exec();
                          //  logger.info(`updatedTag: ${JSON.stringify(updatedTag)}`)
                            insertTagId(atag._id);                            
                            if(category){
                                createCategory(atag._id);
                            }
                        } else {  //exist for the first time
                            logger.debug('atag don\'t exist. We will store a new one.')
                            let tag = new PostModelTag();
                            //let atag = await PostModelTag.findOne({ name: v }).exec();
                            
                            tag.name = v;
                            if(str=='ai'){
                                tag.aiGenerated = true;
                            }
                            let newTag = await tag.save();
                            let updatedTag = await PostModelTag.findOneAndUpdate({ name: v }, { "$push": { posts: id },$inc: { 'count': 1 }} , {
                                new: true // set the new option to true to return the document after update was applied.
                            }).exec();
                            insertTagId(newTag._id);
                            if(category){
                                createCategory(newTag._id);
                            }
                            
                        }            
    
                        console.log('tag saved successfully');


    
                   
 
            }
    
            // );
        },

    //     saveSingle:   (req, res, post)=>{
    //         let post_id = post._id;
    //         let tags = req.body.tags;
    //         let tagsArray = tags.split(',');
    //         logger.info(`tagsArray in tags saving: ${JSON.stringify(tagsArray)}`);

    //         function insertTagId(_id){
    //             Post.findById(post._id, (err, post) => {
            
    //                 Post.findOneAndUpdate({ '_id': post._id }, { $push: { 'tags': _id } }, { new: true }, (err, post) => {
    //                     if (err) {
    //                         console.log(err);
    //                         throw new Error(err);
    //                         //next(err);
    //                     } else {
    //                         //res.redirect('/post/show/'+ post.title);
    //                         console.log('findOneAndUpdate for tags array \'s post is' + post);
    //                         return;
    //                     }
    //                 });
        
    //             });            
    //         }
    //         //let tagString = tag.name;
    //         tagsArray.forEach((v, i, a) => {
    //             //let count;
    //             logger.info('into tagsArray foreach function...')
    //             // logger.info('into tagsArray foreach function async function loop...');
                
    //                 Tag.findOne({ name: v },function(err,atag){
    //                     //logger.info('utility.ObjectIsEmpty(atag): '+utility.ObjectIsEmpty(atag))
    //                     if (utility.ObjectIsEmpty(atag) == false) {  //already exist
    //                         Tag.findOneAndUpdate({ name: v }, { "$push": { posts: post._id },$inc: { 'count': 1 }} , {
    //                                 new: true // set the new option to true to return the document after update was applied.
    //                             }, function(err, updatedTag){
    //                                 if(err){
    //                                     logger.error(`error: ${err}`)
    //                                 }
    //                                 logger.info(`updatedTag: ${JSON.stringify(updatedTag)}`)
    //                             });
    //                             insertTagId(atag._id)
                            
    //                     } else {  //exist for the first time
    //                         let tag = new Tag();
    //                         tag.name = v;
    //                         tag.save(function(err,tag){
    //                             Tag.findOneAndUpdate({ name: v }, { "$push": { posts: post._id },$inc: { 'count': 1 }} , {
    //                                 new: true // set the new option to true to return the document after update was applied.
    //                             }, function(err, updatedTag){
    //                                 if(err){
    //                                     logger.error(`error: ${error}`)
    //                                 }
    //                             });
    //                             insertTagId(tag._id)
    //                         });
                            
    //                     }

    //                     console.log('tag saved successfully');
    //                 })
    
    //         }
    //         );

    // },




    modifyTags: function (tags, fn) {
        // 异步并发

                // 这是你请求数据的方法，注意我是用steTimeout模拟的
        let that = this
        function fetchData (tag) {
            return new Promise(function (resolve, reject) {
                            // posts.forEach(function(post){
                that.modifyTag(tag, function (newTag) {
                resolve(newTag)
                })
                            // });
            })
        }

                // 用数组里面的元素做请求，去获取响应数据
        var promiseArr = tags.map(function (thetag) {
        return fetchData(thetag)
        })

        Promise.all(promiseArr).then(function (respDataArr) {
                        // 在这里使用最终的数据
            logger.debug(respDataArr)
            fn(respDataArr)
        }).catch(function (er) {
            logger.error(`err when using promise in modifiedPosts func: ${er.message ? er.message : er.stack}`)
            throw er;
        })
},

modifyTag: function (tag, cb) {
        let modifiedTag = tag.processTag(tag);

        logger.debug('modifiedTag in modifyTag function' + modifiedTag)
        cb(modifiedTag)
},













};

