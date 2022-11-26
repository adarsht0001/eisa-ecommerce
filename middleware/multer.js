var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/product')
  },
  filename: function (req, file, cb) {
    // const match = ["image/png", "image/jpeg"];
    var ext=file.originalname.substr(file.originalname.lastIndexOf('.'));
// console.log(file.originalname);
    cb(null, 'prodctimg'+Date.now()+ext)
  }
});


module.exports=upload= multer({ storage: storage })