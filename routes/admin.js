var express = require("express");
const { response } = require("../app");
var router = express.Router();

const admimcontroller = require("../controllers/admincontroller");
const upload = require("../middleware/multer");
const auth = require("../middleware/sessionAuth");



/* GET Admin login page. */
router
.route('/')
.get(auth.adminLoginAuth,admimcontroller.getLogin)
.post(admimcontroller.postLogin)

// Gets Adminpanel
router.get("/adminpanel",auth.adminlogin,admimcontroller.adminpanel);

// Gets Category
router.get("/category", auth.adminlogin,admimcontroller.getCategory);

// Gets User
router.get("/adminuser",auth.adminlogin,admimcontroller.getUser);

// Block an user
router.get("/block/:id",admimcontroller.blockuser);

// unblock an user
router.get("/unblock/:id", admimcontroller.unblockuser);

// Get Products
router.get("/products", auth.adminlogin,admimcontroller.getProducts);

// Add a product
router
  .route('/addproduct')
  .get( auth.adminlogin,admimcontroller.getAddproduct)
  .post(upload.array("image", 10), admimcontroller.postAddproduct)


router.get("/deleteProducts/:id", admimcontroller.deleteProduct);

router
  .route("/editproducts/:id")
  .get(auth.adminlogin,admimcontroller.editProduct)
  .post(upload.array("image", 10),admimcontroller.editProductPost);

router.get("/order",auth.adminlogin,admimcontroller.order);

router.get("/vieworderitems/:id",auth.adminlogin,admimcontroller.viewOrderItems);

router.get("/pieData", admimcontroller.pieData);

router.get("/linegraph", admimcontroller.linegraph);

router.get("/yearly", admimcontroller.yearly);

router.get("/cancel/:id/:product",admimcontroller.cancelproduct);

router.post("/orderstatus",admimcontroller.changeOrderStatus);

router.get("/salesReport",auth.adminlogin,admimcontroller.salesReport);

router.get("/coupon", auth.adminlogin,admimcontroller.coupon);

router
  .route("/addcoupon")
  .get(auth.adminlogin,admimcontroller.getaddcoupoun)
  .post(admimcontroller.postaddcoupon);

router.post("/deleteCoupon", admimcontroller.deleteCoupon);

router.get("/banner",auth.adminlogin,admimcontroller.banner);

router
  .route("/addBanner")
  .get(auth.adminlogin,admimcontroller.getAddbanner)
  .post(upload.single("image"),admimcontroller.postAddbanner);

router.get("/deleteBanner/:id",admimcontroller.deleteBanner);

router.put("/changeBannerStatus", admimcontroller.changeBannerstatus);

router.get("/fromto",auth.adminlogin,admimcontroller.fromTo);

router.get("/monthly",auth.adminlogin, admimcontroller.monthly);

router.get("/salesyearly", auth.adminlogin,admimcontroller.yearlySales);

router.get("/categorychart",admimcontroller.categoryChart);

router.get('/findCategory',admimcontroller.findcategory)

router.get('/adminlogout',admimcontroller.logout)

module.exports = router;
