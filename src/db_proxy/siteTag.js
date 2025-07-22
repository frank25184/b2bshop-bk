"use strict";
const User    = require('../models/User'),
    //   Best = require('../models/Best'),
    //   BestTag = require('../models/BestTag'),

      ProTag = require('../models/SiteTag'),
      userProxy = require('../db_proxy/user'),
      moment = require('moment'),    
      asyncErrHandle = require('../common/asyncErrHandle'),
      logger = require('../libs/logger'),
      utility = require('../libs/utility');                              


module.exports = {

        /**
         * for products
         * @id  product id  for product id
         * @tags String or Array: "exchange,centralized",or ["a","b"]
         * @ProductModel Model
         * @ProductModelTag Tag
         * **/
       saveSingle:async (id,tags, ProductModel,ProductModelTag)=>{
       
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
            ProductModel.findById(id, (err, data) => {
                if(err){
                    logger.error(`error in Postmodel.FindById: ${err}`);
                    throw new Error(err);
                }
                if(data){
                    ProductModel.findOneAndUpdate({ '_id': id }, { $push: { 'tags': _id } }, { new: true }, (err, data) => {
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
                    });
                }else{
                    logger.error(`no data from PostModel.findById. data: ${JSON.stringify(data)}`);
                }

    
            });            
        }



        //let tagString = tag.name;
        for(let i=0; i<tagsArray.length;i++) {
            //let count;
            logger.info('into tagsArray if loop...')
               // logger.info('into tagsArray foreach function async function loop...');
               let v = tagsArray[i].trim();
               v = v.toLowerCase();
                  // let atag = await PostModelTag.findOne({ name: v }).exec();
                  let atag = await ProductModelTag.findOne({ name: v }).exec();
                    logger.info('utility.ObjectIsEmpty(atag): '+utility.ObjectIsEmpty(atag))
                    // if(err){
                    //     logger.error(`error in PostmodelTag.findOne: ${err}`);
                    //     throw new Error(err);
                    // }
                    //utility.ObjectIsEmpty(atag) == false
                    console.log(`atag type: ${typeof(atag)};  atag: ${JSON.stringify(atag)}; atag: atag==false: ${atag==false}`)
                    if (atag) {  //already exist
                        logger.debug('atag exist...'); 
                        let updatedTag = await ProductModelTag.findOneAndUpdate({ name: v }, { "$push": { products: id },$inc: { 'count': 1 }}, {
                             new: true 
                             // set the new option to true to return the document after update was applied.
                        }).exec();
                      //  logger.info(`updatedTag: ${JSON.stringify(updatedTag)}`)
                        insertTagId(atag._id);                            
                    } else {  //exist for the first time
                        logger.debug('atag don\'t exist. We will store a new one.')
                        let tag = new ProductModelTag();
                        //let atag = await PostModelTag.findOne({ name: v }).exec();
                        
                        tag.name = v;
                        let newTag = await tag.save();
                        let updatedTag = await ProductModelTag.findOneAndUpdate({ name: v }, { "$push": { products: id },$inc: { 'count': 1 }} , {
                            new: true // set the new option to true to return the document after update was applied.
                        }).exec();
                        insertTagId(newTag._id);
                        
                    }            

                    console.log('tag saved successfully'); 

        }

        // );
       },



};

