var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('node-tesseract-ocr');



// Define the storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/'); // Specify the destination folder where images should be stored
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

router.post('/converted', upload.array('files'), function(req, res, next) {

  if (req.fileValidationError) {
    return res.render('index', { title: 'Image To Text', errorMessage: req.fileValidationError});
  }

  else{
    // return res.render('index', { title: 'Image To Text', errorMessage: null});
    req.files.forEach((file)=>{
      const imagePath = file.path;
      console.log(imagePath);
      Tesseract.recognize(imagePath, {
        lang: 'nep',
        oem: 1,
        psm: 3,
      })
        .then((text)=>{
          const textFilePath =imagePath + '.txt';
          fs.writeFileSync(textFilePath, text);
        });
      })
      .catch((err)=>{
        console.log("something errors");
      });
  }
});


module.exports = router;