'use strict';

const utils = require('../libs/utility');
const  { IncomingForm }  = require('formidable');


/**
 * upload single image
 * @param {String} uploadDir : absolute file path (C:\\Users\)
 * @param {String} filename: img file name(need to be modified in your app and store the filename to db in your app)
 * usage: require('./utility.js').checkDir(dataDir);
 */
const uploadSingleImg = (req, res, uploadDir,filename) => {
   
   //below are the code you need to modify:
    // let dataDir = config.uploadDir;
    // console.log(dataDir);
    // let photoDir = dataDir + 'logo/';   
    //let personalDir = `${req.user._id}/`;
    //name = req.user._id + name;

    // //also can use:
    utils.checkDir(uploadDir);
    // utils.checkDir(photoDir);	



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
        
        
        const form =  new IncomingForm({ 
            multiples: false,
            maxFileSize: 5242880,  /**5 * 1024 * 1024 (5mb)**/
            keepExtensions: false,
            uploadDir: uploadDir,
            allowEmptyFiles: false,
            minFileSize: 1,/* 1 byte*/
            filename: function(name, ext, part, form){
                name = filename
                return name;
            },/*default undefined Use it to control newFilename. Must return a string. Will be joined with options.uploadDir.*/
        
        });

        return;

        // form.parse(req,(err,fields,file)=>{

        //     if(err){
        //             req.flash('error','form parse error:' + err);
        //             return res.redirect(500, '/response/err/500');
        //     }else{
        //              const photo = file.photo;
        //              let photoName = photo.name
                    
                    
        //             // let thedir = photoDir + personalDir;
        //             // //prevent uploading file with the same name



        //             // const photoName = req.user._id + photo.name; 
                    
        //             // const fullPath = thedir + photoName;

        //             // //checkDir need to be passed to have a callback so that the thedir is generated before the rename function being called
        //             // utils.checkDir(thedir,()=>{
        //             //     fs.rename(photo.path, fullPath, err=>{
        //             //         if (err) {console.log(err); return; }
        //             //         console.log('The file has been re-named to: ' + fullPath);
        //             //     });										
        //             // });

        //             // console.log('the dir is :' + thedir);
        //             // console.log(photo.name,photo.path,fullPath);
                    
        //             //rename or move the file uploaded;and photo.path is the temp file Formidable give
                                    
        //             if(req.user){
        //                 function saveFileInfo(){
                            
        //                     const user = req.user;
        //                     user.logo = photoName;
        //                     user.save(err=>{
        //                         if(err){throw err}
        //                         req.flash('success','Upload your logo successfully');
        //                         res.redirect('/user/profile/'+ user._id);
        //                     });

        //                 }
        //                 saveFileInfo();
        //                 return;
        //                 // req.flash('success', 'Uploading successfully!');
        //                 // return res.xhr ? res.json({success: true}) :
        //                 // res.redirect(303, '/success');
        //             //  saveFileInfo('upload-photo', fields.email,req.params.year,fields.params.year,fields.params.month,path);
        //             }else{
        //                 console.log('user not login');
        //                 req.flash('eror','You need to login first to upload your logo');
        //                 res.redirect(303, '/user/login');
        //             }								
        //     }


        //     //console.log('received fields:', fields);
        //     //console.log('received files:', photo.name);

        // });


    } catch(ex){
        return res.xhr ?
            res.json({error: 'Database error.'}):
            res.redirect(303, '/response/error/500');
    }
}


module.exports = {
    uploadSingleImg,
};

