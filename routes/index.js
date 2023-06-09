var express = require('express');
var router = express.Router();
const multer = require('multer');
const path = require('path');

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
  } else {
    cb(new Error("manual: you are not uploading image")); // Reject the file
  }
};

// Configure multer with the storage settings
const upload = multer({ storage: storage, fileFilter: fileFilter});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image To Text', fileFilter: fileFilter});
});

router.post('/converted', upload.array('files'), function(req, res, next) {
  res.redirect('/');
});



module.exports = router;
