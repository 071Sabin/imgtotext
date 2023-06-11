var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const Tesseract = require('node-tesseract-ocr');
// const { v4: uuidv4 } = require('uuid'); //used to create random texts of 32 places.

const app=express();
app.use(cookieParser());


const generateUserId = function(req, res, next){
  const userRandomId = Math.random().toString(36).substr(2, 9);
  res.cookie('userId', generateUserId(), { maxAge: 30 * 24 * 60 * 60 * 1000 }, { httpOnly: true, sameSite: 'strict' });
  return`user_${userRandomId}`;
}


// Middleware to check if user ID cookie is set, and if not, generate a new one
// app.use((req, res, next) => {
//   if (!req.cookies.userId) {
//     const userId = generateUserId();
//     console.log("cookie userid: " + userId);
//     res.cookie('userId', userId, { maxAge: 30 * 24 * 60 * 60 * 1000 }, { httpOnly: true, sameSite: 'strict' }); // Expires in 30 days:: { httpOnly: true, sameSite: 'strict' }
//   }else{
//     console.log("user id in cookie is already SET!!!!!!!!");
//   }
//   next();
// });

// Define the storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.cookies.userId;
    // console.log("|||user id from cookie is===> ", userId);
    
    // creating a unique folder for every users.
    const folderName = `./public/uploads/${userId}`;
    const imgFolder = path.join(folderName, 'images');

    if(!fs.existsSync(folderName)){
      fs.mkdirSync(folderName);
    }
    if(!fs.existsSync(imgFolder)){
      fs.mkdirSync(imgFolder);
    }
    cb(null, imgFolder); // Specify the destination folder where images should be stored
  },
  
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, Date.now() + extension); // Use the current timestamp as the filename to ensure uniqueness
  },
});


const fileFilter = (req, file, cb) => {

  // Check if the file type is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept the file
  } 
  // Reject the file with error message
  else {
    req.fileValidationError = "Oops, please upload image files only !!";
    cb(null, false); 
  }
};


// Configure multer with the storage settings
const upload = multer({ storage: storage, fileFilter: fileFilter});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image To Text', errorMessage: null});
});

// write upload.array('input field name', maxcount)
router.post('/converted', upload.array('files'), function(req, res, next) {

  if (req.fileValidationError) {
    return res.render('index', { title: 'Image To Text', errorMessage: req.fileValidationError});
  }

  else{
    // return res.render('index', { title: 'Image To Text', errorMessage: null});
    // res.cookie('userId', generateUserId(), { maxAge: 30 * 24 * 60 * 60 * 1000 }, { httpOnly: true, sameSite: 'strict' });
    const inpvalue = req.body.language;
    let lng = "";
    if(inpvalue === '1'){
      lng='nep';
    }
    if(inpvalue == '2'){
      lng='eng';
    }
    
    req.files.forEach((file)=>{
      const imagePath = file.path;
      Tesseract.recognize(imagePath, {
        lang: lng,
        oem: 1,
        psm: 3,
      })

      .then((text)=>{
        // console.log(text);

        const textFolder = path.join(path.dirname(file.destination), 'texts');
        if(!fs.existsSync(textFolder)){
          fs.mkdirSync(textFolder);
        }

        // 1. seperating file name and extension. And removing the extension .jpg at last or whatever the extensions is.
        //    basically extracting name of the file.
        
        // const textFilePath1=(path.basename(imagePath).slice(0, -path.extname(imagePath).length));

        // file.originalname represents the filename as the user uploaded. we're removing extension and just getting basename from imagename.jpg
        const textFilePath = path.join(textFolder, `${path.basename(file.originalname, path.extname(file.originalname))}.txt`);
        fs.writeFileSync(textFilePath, text);
      });
    })
    res.redirect('/');
  }
});



module.exports = router;