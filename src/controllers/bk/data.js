"use strict";
const env = process.env.NODE_ENV || 'development';
const config = require(`../../config.${env}.js`);
const logger = require('../libs/logger');
// const  { IncomingForm }  = require('formidable');
const tagProxy = require('../db_proxy/tag');
// const Tag = require('../models/BestTag');

const  User = require('../models/User'),
    //   Best = require('../models/Best'),
      Site = require('../models/Product'),
      utils = require('../libs/utility'),
      siteProxy = require('../db_proxy/site');
    //   bestProxy = require('../db_proxy/best');

const changeString = require('../../data/changeStringValue');
const insertDynamic = require('../../data/insertDynamic');
// const imgDownload = require('../../data/__downloadIMG');
const rewrite = require('../../data/rewrite');
const producthunt = require('../../data/producthunt');
const seo = require('../config/seo');
//const puppeteer = require("puppeteer");

module.exports = {

    // screenshot: async (req,res)=>{
        
    //     let sites = await Site.find({imageCrawled: false,down:false}).exec();
    //     console.log(`into screenshot..site.length${sites.length}`)
    //     if(sites){
    //         for(let i=0; i<sites.length;i++){
    //             let site = sites[i];
    //             console.log(`into loop ${site.name}`)
    //             if(utils.linkAccessible(site.url)){
    //                 await shot(site);
    //                 await Site.findOneAndUpdate({'_id': site._id},{imageCrawled: true}).exec();  
    //                 console.log(`${site.name} fininshed.Next...`)        
    //             }else{
    //                 continue; // move to the next iteration of the loop
    //             }
    //         }
    //         async function shot(site){

    //             // we're using async/await - so we need an async function, that we can run

    //               // open the browser and prepare a page
    //               const browser = await puppeteer.launch()
    //               const page = await browser.newPage()
                
    //               // set the size of the viewport, so our screenshot will have the desired size
    //               await page.setViewport({
    //                   width:1680,
    //                   height:876
    //               })//640 × 334
                
    //               await page.goto(site.url,{
    //                   timeout: 100 * 1000,
    //                   waitUntil: ['domcontentloaded'],
    //               })

    //              // wait for 2 seconds
    //               await page.waitForTimeout(4000);
                  
    //               await page.screenshot({
    //                   path: `/programs/gpt/gptDir/src/public/images/test/${site.name_changed}.png`,
    //                   fullPage: false
    //               })
                
    //               // close the browser 
    //               await browser.close();
           


    //         }
    //         console.log('Finished generating screenshots!');
    //     }else{
    //         console.log('no site left...existing...');

    //     }

        
    //     console.log('Finished generating screenshots!');

    // },
    producthunt: async (req,res) =>{
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                try {
                //    await producthunt.collectLink();
                   await producthunt.getData();       
                    console.log(`fetch successfully today.`)             
                } catch (error) {
                    logger.error(`error: ${error.stack} `);
                    return;
                }

               // producthunt.getData();

            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }   
    },
    insertDynamic:async (req,res) => {
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                insertDynamic(req, res);
                console.log(`fetch successfully today.`)
            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },
    replaceURL:  async (req,res) => {
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                replaceURL(req, res);
            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },
   // {changebParaphraser,changeWriting,changeCode,changePrompts,changeSEO};
    changeString: async (req,res) => {
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                changeString.changebParaphraser(req, res);
            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },

    changeWriting: async (req,res) => {
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                changeString.changeWriting(req, res);
            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },

    changeCode: async (req,res) => {
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                changeString.changeCode(req, res);
            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },


    changePrompts: async (req,res) => {
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                changeString.changePrompts(req, res);
            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },

    changeSEO: async (req,res) => {
        let user = req.user;
        let isAdmin = false;

        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                changeString.changeSEO(req, res);
            }else{
                console.log(`is not Admin ${isAdmin}: quiting...`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },








    insertBulkEx: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
        let para = req.params.dataFileName;
        console.log(`into dataFileName`)
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                bulkInsert(para,req, res);
            }else{
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },
    // downloadIMG: async (req,res) => {
    //     let user = req.user;
    //     let isAdmin = false;
       
    //     console.log(`into DOWNLOADIMG`)
    //     if(user){
    //         user = user.processUser(user);
    //         isAdmin = user.admin;
    //         if(isAdmin){
    //             console.log(`isAdmin ${isAdmin}`)
    //             imgDownload();
    //         }else{
    //             res.redirect('/')
    //         }

    //     } else{
    //         res.redirect('/')
    //     }
    // },


    rewriteDB: async (req,res) => {
        let user = req.user;
        let isAdmin = false;
       
        console.log(`into rewriting`)
        if(user){
            user = user.processUser(user);
            isAdmin = user.admin;
            if(isAdmin){
                console.log(`isAdmin ${isAdmin}`)
                rewrite();
            }else{
                console.log(`is not Admin or not login`)
                res.redirect('/')
            }

        } else{
            res.redirect('/')
        }
    },
 

}