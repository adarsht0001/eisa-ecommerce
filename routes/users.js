var express = require("express");
var router = express.Router();
const user = require("../controllers/user")
const cart = require("../controllers/cartController");
const order = require("../controllers/orderController");
const auth=require('../middleware/sessionAuth')


/* GET users Page. */
router.route("/")
  .get(auth.getOriginalurl,user.home);

/* user Login */
router
  .route("/login")
  .get(auth.loginauth,user.loginpage)
  .post(user.postLogin)

/*User Signup page*/
router
  .route("/signup")
  .get(auth.loginauth,user.getSignup)
  .post(user.postSignup)

/*Shoping Page*/
router
  .route("/shop")
  .get(auth.getOriginalurl,user.getShop);

// View single product
router
  .route("/productview/:id")
  .get(auth.getOriginalurl,user.productView);

// otp mobile number enter page
router
  .route("/login-otp")
  .get(auth.loginauth,user.getOTP) //otp mobile entering
  .post(user.postOTP) // otp sending setup

//page to enter otp
router
  .route("/verify-otp")
  .get(auth.otpAuth,user.getverifyotp)
  .post(user.postVerifyOtp)

// user cart
router
  .route("/cart")
  .get(auth.getOriginalurl,auth.usrauth, cart.getCart)

// delete item from user cart
router
  .route("/delete/:id")
  .get(cart.deleteCart);

//change Product quantity
router
  .post("/changequantity", cart.changequantity);

// add to cart
router
  .get("/addtocart/:id", cart.addtoCart);

router
.route('/checkout')
  .get(auth.getOriginalurl,auth.usrauth, order.checkout)
  .post( order.checkoutPOst)

router
  .get("/ordersucess",auth.getOriginalurl,auth.usrauth, order.ordersucess);

router.
  get("/order", auth.getOriginalurl,auth.usrauth, order.viewOrder);

router
  .get("/cancelOrder/:id/:product",order.cancelOrder);

router
  .post("/verify-payment", order.verifyRazor);

router
  .delete("/onfailure",order.RazorPayOnFailure);

router
  .get("/verifyPaypal", order.paypalVerify);

router
  .get("/userPage",auth.getOriginalurl, auth.usrauth, user.userPage);

router
  .get("/userAddress",auth.getOriginalurl, auth.usrauth, user.userAddress);

router
  .post("/editprofile",auth.getOriginalurl,auth.usrauth, user.editprofile);

router
  .get("/cancel", order.paypalCancel);

router
  .post("/applyCoupon",order.applycoupon);

router
  .post("/assigncoupon",order.assignCoupon)

router
  .get("/wallet", auth.getOriginalurl,auth.usrauth, user.userwallet);

router
  .get("/return/:id/:product",user.returnProduct);

router
  .get("/wishlist", auth.getOriginalurl,auth.usrauth, user.getWishlist);

router
  .post("/addtoWhislist", user.addWishlist);

router
  .get("/deleteItemWishlist/:id",user.delWishItem);

router
  .post("/editAddress", user.editAddres);

router
.route('/changePassword')
.get(auth.usrauth,user.getChangepassword)
.post(user.changepassword)

router
.route('/changpasswordotp')
.get(auth.usrauth,user.changePasswordOTP)
.post(user.otpPasswordChange)

router
  .route('/chngePassOTP')
  .get(auth.usrauth,user.chngePassOTP)
  .post(user.changeotpverify)

// user log out
router.get("/logout", user.logout);

module.exports = router;
