"use strict";
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');


let utils = require('../../libs/utility');

const env = process.env.NODE_ENV || 'development';
const config = require(`../../../config.${env}.js`);
let uploadDir = config.uploadDir + 'best/'
utils.checkDir(config.uploadDir);
utils.checkDir(uploadDir);
//const upload_best = multer({ dest: uploadDir });

// const editor = require('../../controllers/editor');


multer.diskStorage({
    destination: function(req, file, callback) {
      callback(null, uploadDir);
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname);
    }

  });

  router.post('/best',   function(req,res){
    res.send(`/src/public/upload/${req.file.filename}`);
  });

/* GET home page. */
// router.post('/best', upload_best.single('image'),  function(req,res){
// //This will store the uploaded file in the uploads/ directory, and you can access the file using the req.file object.

// // Move uploaded file to public directory
//     const filePath = path.join(__dirname, 'public', req.file.filename);
//     console.log('req.file.path' + req.file.path, 'filePath' + filePath)
//     fs.rename(req.file.path, filePath, (err) => {
//         if (err) {
//          console.error(JSON.stringify(err))
//          res.send('Error uploading image');
//         } else {
//         // Return URL of uploaded file
//          res.send(`/public/${req.file.filename}`);
//         }
//     });

// });

// router.get('/about', main.about);

module.exports = router;
