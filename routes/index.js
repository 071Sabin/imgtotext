var express = require('express');
var router = express.Router();

// multer for file handling
const multer = require('multer');

const upload = multer({dest: './public/uploads/'});
const app = express();

// app.use(express.static('public'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Image To Text' });
});

router.post('/converted',upload.array("files"), function(req, res, next){
  res.send("file uploaded");
});


module.exports = router;