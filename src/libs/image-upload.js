'use strict';
const config = require('../common/get-config'),
      env = process.env.NODE_ENV || 'develop',
      logger = require('./logger'),
      formidable = require('formidable'),
      utils = require('../libs/utility');


/**
 * @folderName String     'logo/'
 * @multi Boolean       whether multiple imgs allowed or not
 * **/
function UserLogoUpload (req, res,app) {
         // if(app.get('env')=== 'development' || app.get('env')=== 'test'){
             //dataDir = config.uploadDir;
         // }else{
         // 	dataDir = config.uploadDir.production;
         // }
         let photoDir = config.uploadDir + 'logo/';
         //existsSync depreciated!! do not use it any more
         // fs.existsSync(dataDir)  || fs.mkdirSync(dataDir);
         // fs.existsSync(photoDir) || fs.mkdirSync(photoDir);

         //also can use:
         utils.checkDir(photoDir);		
         // fs.access(dataDir, fs.constants.F_OK, function(err) {
         //     if (!err) {
         //         // Do something
         //         console.log(dataDir + 'the folder exits!')

         //     } else {
         //         // It isn't accessible
         //         fs.mkdirSync(dataDir);
         //     }
         // });
         // fs.access(photoDir, fs.constants.F_OK, function(err) {
         //     if (!err) {
         //         // Do something
         //         console.log(photoDir + 'the folder exits!')

         //     } else {
         //         // It isn't accessible
         //         fs.mkdirSync(photoDir);
         //     }
         // });			
         //fs.constants.F_OK - path is visible to the calling process. This is useful for determining if a file exists, but says nothing about rwx permissions. Default if no mode is specified.
         // fs.constants.R_OK - path can be read by the calling process.
         // fs.constants.W_OK - path can be written by the calling process.
         // fs.constants.X_OK - path can be executed by the calling process. This has no effect on Windows (will behave like fs.constants.F_OK).

         

         try{
             //store the data to the database
             //...
             //console.info('Received contact from ' + req.user.username + " <" + req.user.email + '>' );
             
             const form = formidable({ multiples: false/*,uploadDir: photoDir */ });

             form.parse(req,(err,fields,file)=>{

                 if(err){
                         req.flash('error','form parse error:' + err);
                         //return res.redirect(500, '/response/err/500');
                            next(err);
                            return;
                 }
                logger.debug(`form upload fields: ${JSON.stringify(fields)}  form upload files: ${JSON.stringify(files)} `)
                
                const photo = file.photo;
                
                let personalDir = `${req.user._id}/`;
                let thedir = photoDir + personalDir;
                //prevent uploading file with the same name



                const photoName = req.user._id + photo.name; 
                
                const fullPath = thedir + photoName;

                //checkDir need to be passed to have a callback so that the thedir is generated before the rename function being called
                utils.checkDir(thedir,()=>{
                    fs.rename(photo.path, fullPath, err=>{
                        if (err) {logger.error('rename img error: ' + err); return; }
                        logger.debug('The file has been re-named to: ' + fullPath);
                    });										
                });

                logger.debug('the dir is :' + thedir);
                logger.debug(photo.name,photo.path,fullPath);
                
                //rename or move the file uploaded;and photo.path is the temp file Formidable give
                                
                if(req.user){
                    function saveFileInfo(){
                        
                        const user = req.user;
                        user.logo = photoName;
                        user.save(err=>{
                            if(err){throw err}
                            req.flash('success','Upload your logo successfully');
                            res.redirect('/profile/'+ user.username_changed);
                        });

                    }
                    saveFileInfo();
                    // req.flash('success', 'Uploading successfully!');
                    // return res.xhr ? res.json({success: true}) :
                    // res.redirect(303, '/success');
                //  saveFileInfo('upload-photo', fields.email,req.params.year,fields.params.year,fields.params.month,path);
                }else{
                    logger.debug('user not login');
                    req.flash('eror','You need to login first!');
                    res.redirect(303, '/user/login');
                }								
                 
                 //console.log('received fields:', fields);
                 //console.log('received files:', photo.name);

             });


         } catch(ex){
             return res.xhr ?
                 res.json({error: 'Database error.'}):
                 res.redirect(303, '/response/error/500');
         }

}


function PostImageUpload(req, res){
         let uploadDir = config.uploadDir
         let photoDir = config.uploadDir + 'article/';
         utils.checkDir(uploadDir);
         utils.checkDir(photoDir);	
         console.log('into postimage before req.body.image..')


       // console.log(`req.body.image ${JSON.stringify(req.body)}`)

         const photo =  req;
         console.log('into postimage upload...' + photo)

         //logger.debug(`photo: ${JSON.stringify(photo)}   photo.name ${photo.name}`)
                
         let personalDir = `articles/`;
         let thedir = photoDir + personalDir;
         //prevent uploading file with the same name

         const photoName = Date.now() + photo.name; 
         
         const fullPath = thedir + photoName;

         //checkDir need to be passed to have a callback so that the thedir is generated before the rename function being called
         utils.checkDir(thedir,()=>{
             fs.rename(photo.path, fullPath, err=>{
                 if (err) {logger.error('rename img error: ' + err); return; }
                 logger.debug('The file has been re-named to: ' + fullPath);
             });										
         });
                

        logger.debug('the dir is :' + thedir);
        logger.debug(photo.name,photo.path,fullPath);
                
                //rename or move the file uploaded;and photo.path is the temp file Formidable give
                                
							




        //  } catch(ex){
        //      return res.xhr ?
        //          res.json({error: 'Database error.'}):
        //          res.redirect(303, '/response/error/500');
        //  }



}








module.exports = {UserLogoUpload, PostImageUpload};