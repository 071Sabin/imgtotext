var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('node-tesseract-ocr');
const { v4: uuidv4 } = require('uuid');




// Define the storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = uuidv4();
    const folderName = `./public/uploads/${userId}`;
    const imgFolder = path.join(folderName, 'images');
    const textFolder = path.join(folderName, 'texts');
    fs.mkdirSync(folderName);
    fs.mkdirSync(imgFolder);
    fs.mkdirSync(textFolder);
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
  res.render('index', { title: 'Image To Text', errorMessage: null, text: null});
});

router.post('/converted', upload.array('files'), function(req, res, next) {

  if (req.fileValidationError) {
    return res.render('index', { title: 'Image To Text', errorMessage: req.fileValidationError});
  }

  else{
    // return res.render('index', { title: 'Image To Text', errorMessage: null});

    const inpvalue = req.body.language;
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
        const textFilePath = imagePath + '.txt';
        fs.writeFileSync(textFilePath, text);
      });
    })
    res.redirect('/');

    // .catch((err)=>{
    //   console.log("something errors");
    // });
  }
});


module.exports = router;