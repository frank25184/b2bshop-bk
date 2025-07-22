var express = require('express');
var router = express.Router();

const multer = require('multer');
const path = require('path');

let utils = require('../../libs/utility');

const env = process.env.NODE_ENV || 'development';
const config = require(`../../../config.${env}.js`);

const admin = require('../../controllers/admin'),
auth = require('../../middlewares/auth');
const product = require('../../controllers/product');
// const Feedback = require('../../models/Feedback');

// const TopNews = require('../../models/TopNews');
// const topProxy = require('../../db_proxy/top'),
productProxy = require('../../db_proxy/product');
const { csrfProtection, generateCsrfToken } = require('../../middlewares/csrf');

function upload(dir){
  let uploadDir = config.uploadDir + dir
  utils.checkDir(config.uploadDir);
  utils.checkDir(uploadDir);
  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  
  const upload = multer({ storage });  
  return upload;
}
// let upload_product_post =  upload('products/thumbnail/');
let upload2product =  upload('products/');
// let upload_article_post =  upload('articles/thumbnail/');
let upload2article =  upload('articles/');

//article image upload
// router.post('/upload', upload_product_post.single('image'), (req, res) => {
//   if (req.file) {
//     res.json({ filename: req.file.filename });
//   } else {
//     res.status(400).json({ error: 'No file uploaded' });
//   }
// });

//tinymice content
router.post('/upload2article', upload2article.single('image'), (req, res) => {
  if (req.file) {
    res.json({ filename: req.file.filename });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

//tinymice content
router.post('/upload2product', upload2product.single('image'), (req, res) => {
  if (req.file) {
    res.json({ filename: req.file.filename });
  } else {
    res.status(400).json({ error: 'No file uploaded' });
  }
});

//tinymice content
// router.post('/upload2top', upload2top.single('image'), (req, res) => {
//   if (req.file) {
//     res.json({ filename: req.file.filename });
//   } else {
//     res.status(400).json({ error: 'No file uploaded' });
//   }
// });

// router.post('/feedback',async (req, res) => {
//   let user = req.user;
//   let isAdmin = false;
  
//   let user_id;
//   if(user){
//       user = user.processUser(user);
//       isAdmin = user.admin;
//       user_id = user._id;
//   }
//   console.log('into admin/feedback')
//    let {email, name, feedback} = req.body;
//    let data;
//    if (!feedback) {
//     console.log('no feedback')
//     data = {choices:[{"message": {content: 'Missing required parameter: Feedback.'}}], status: 400};
//     return res.status(200).json(data);
//    }

//    //test if the email format is right
//    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // 定义一个验证email格式的正则表达式
//    if (!regex.test(email)) { // 如果email不为空，但是不符合正则表达式
//       console.log('invalid email'); // 输出invalid email
//       data = {choices:[{"message": {content: 'Invalid email format.'}}], status: 400}; // 定义一个返回数据对象，包含错误信息和状态码
//       return res.status(200).json(data); // 返回数据对象给用户
//    } 

//    let newFb = new Feedback();
//    if(user_id){
//     newFb.user = user_id;
//    }
//    newFb.email = email;
//    newFb.name = name;
//    newFb.feedback = feedback;

//    try {
//     await newFb.save();

//      data = {choices:[{"message": {content: `Thanks for your feeekback!`}}], status: 200};
//      console.log(`data: ${JSON.stringify((data))}`);
//     return res.status(200).json(data);

//    } catch (error) {
//     data = {choices:[{"message": {content: `Something went wrong. Please try again later!`}}], status: 400};
//     console.log(`data: ${JSON.stringify(data)}, error: ${JSON.stringify(error)} `);
//     return res.status(200).json(data);
//    }
   
// });

//best image upload
// router.post('/upload-tool', upload_best.single('image'), (req, res) => {
//   if (req.file) {
//     res.json({ filename: req.file.filename });
//   } else {
//     res.status(400).json({ error: 'No file uploaded' });
//   }
// });

/**product**/
/**site**/
router.get('/submitProduct', auth.isLoggedIn,  product.makeProduct);//detailed site
router.post('/submit-product', auth.isLoggedIn,  product.postProductForMultiIMG);


/**article**/
router.get('/make-article', auth.isLoggedIn, admin.makeArticle);
router.post('/post-article', auth.isLoggedIn, admin.postArticle);


//router.get('/managePosts',auth.isLoggedIn, admin.managePosts);

// router.post('/managePostsSent', auth.isLoggedIn, admin.managePostsSent);
// router.get('/getUnsubscribe', admin.getUnsubscribe);
// router.post('/postUnsubscribe', admin.postUnsubscribe);

// Email verification route
router.post('/subscribe', admin.postSubscribe);
router.get('/verify-email/:token', admin.verifyEmail);

//router.post('/autoUploadReview', admin.reviewUploadAuto);
//router.get('/reviewAutoUpload', admin.getReviewUploadAuto);

module.exports = router;
