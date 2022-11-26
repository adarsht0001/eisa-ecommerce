const userHelper = require("../helper/userhelper");
const categoryhelper = require("../helper/categoryhelper");
const carthelper = require("../helper/carthelper");
const orderhelper = require("../helper/orderhelper");
const producthelper = require("../helper/producthelper");

const wishlistHelper = require("../helper/wishlistHelper");
require('dotenv').config()
// twilio client setup
const client = require("twilio")(process.env.twilio_accountSID, process.env.twilio_authToken);

module.exports = {
  home:function (req, res, next) {
    userHelper.getBanner().then(async (banner) => {
      let first = banner[0];
      banner.shift();
      let Topproducts = await userHelper.topProducts();
      let category = await categoryhelper.bestCategory();
      let allproducts = await producthelper.getAllProducts();
      let products = allproducts.slice(0, 8);
      if (req.session.user) {
        let wishItem = await wishlistHelper.getwishlist(req.session.user._id);
        Topproducts.forEach((element) => {
          wishItem.forEach((item) => {
            if (element.products._id.equals(item.products._id)) {
              element.wishlist = true;
            }
          });
        });
        products.forEach((element) => {
          wishItem.forEach((item) => {
            if (element._id.equals(item.products._id)) {
              element.wishlist = true;
            }
          });
        });
      }
      res.render("user/index", {
        user: req.session.user,
        first,
        banner,
        Topproducts,
        products,
        category,
      });
    });
  },

  loginpage: (req, res) => {
    res.render("user/userlogin", {
      errorMessage: req.session.invalid,
    });
    delete req.session.invalid;
  },

  postLogin: (req, res, next) => {
    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.userLogIn = true;
        req.session.user = response.user;
        let redirect = req.session.returnToUrl || "/";
        delete req.session.returnToUrl;
        res.redirect(redirect);
      } else if (response.block) {
        req.session.invalid = "You Have been Blocked By admin";
        res.redirect("/login");
      } else {
        req.session.invalid = "Invalid Password or Email";
        res.redirect("/login");
      }
    });
  },

  getSignup: (req, res) => {
    res.render("user/usersignup", {
      errorMessage: req.session.emailUsed || req.session.invalidRefereal,
    });
    delete req.session.emailUsed;
  },

  postSignup: (req, res) => {
    userHelper
      .doSignup(req.body)
      .then((response) => {
        if (response.email) {
          req.session.emailUsed = "Email Already Exists";
          res.redirect("/signup");
        } else {
          res.redirect("/login");
        }
      })
      .catch((msg) => {
        req.session.invalidRefereal = "Invalid Refereal";
        res.redirect("/signup");
      });
  },

  getShop: async (req, res) => {
    let category = await categoryhelper.viewcategory();
    let products = await producthelper.getAllProducts();
    if (req.session.user) {
      let wishItem = await wishlistHelper.getwishlist(req.session.user._id);
      products.forEach((element) => {
        wishItem.forEach((item) => {
          if (element._id.equals(item.products._id)) {
            element.wishlist = true;
          }
        });
      });
    }
    res.render("user/shoping", {
      products,
      user: req.session.user,
      category,
    });
  },

  productView: async (req, res) => {
    proid = req.params.id;
    let itexist = false;
    whishcheck = false;
    await producthelper.findProductDetails(req.params.id).then(async (data) => {
      if (req.session.user) {
        itexist = await carthelper.exists(req.session.user._id, proid);
        whishcheck = await wishlistHelper.checkWishList(
          req.session.user._id,
          proid
        );
      }
      res.render("user/productview", {
        data,
        user: req.session.user,
        itexist,
        whishcheck,
      });
    });
  },

  getOTP: (req, res) => {
    res.render("user/otpenter", {
      errorMessage: req.session.invalidnum,
    });
    req.session.invalidnum = false;
  },

  postOTP: (req, res) => {
    userHelper
      .dootp(req.body.phone)
      .then((response) => {
        if (response.blocked) {
          req.session.invalidnum = "You Have Been Blocked";
          res.redirect("/login-otp");
        } else {
          req.session.user = response;
          client.verify
            .services(process.env.twilio_serviceID)
            .verifications.create({
              to: `+91${req.body.phone}`,
              channel: "sms",
            })
            .then((data) => {
              req.session.mobilenumber = data.to;
              res.redirect("/verify-otp");
            })
            .catch((error) => {
              console.error(error);
            });
        }
      })
      .catch(() => {
        req.session.invalidnum = "Mobile not found";
        res.redirect("/login-otp");
      });
  },
  getverifyotp: (req, res) => {
    res.render("user/otpconfirm", {
      phone: req.session.mobilenumber,
      otp: req.session.otpfail,
    });
    req.session.otpfail = false;
  },
  postVerifyOtp: (req, res) => {
    var arr = Object.values(req.body);
    var otp = arr.toString().replaceAll(",", "");
    client.verify
      .services(process.env.twilio_serviceID)
      .verificationChecks.create({
        to: req.session.mobilenumber,
        code: otp,
      })
      .then((data) => {
        if (data.valid) {
          req.session.userLogIn = true;
          res.redirect("/");
        } else {
          req.session.otpfail = "Invalid otp";
          res.redirect("/verify-otp");
        }
      });
  },
  userPage: async (req, res) => {
    user = await userHelper.getUser(req.session.user._id);
    res.render("user/userPage", {
      user,
    });
  },
  userAddress: async (req, res) => {
    recent = await userHelper.recentAddress(req.session.user._id);
    userHelper.getAddres(req.session.user._id).then((response) => {
      if (response.length > 0) {
        address = response[0];
      } else {
        address = false;
      }
      res.render("user/useraddress", {
        recent,
        address,
      });
    });
  },
  editprofile: (req, res) => {
    userHelper.updateUser(req.body, req.session.user._id).then(() => {
      res.redirect("/userPage");
    });
  },
  userwallet: (req, res) => {
    userHelper
      .ViewWallet(req.session.user._id)
      .then(async (Wallet) => {
        let History = await userHelper.walletHistory(req.session.user._id);
        let referral = await userHelper.referrel(req.session.user._id);
        referral.forEach((Element) => {
          if (Element.History.From === "Purchase") {
            Element.purchase = true;
          }
        });
        res.render("user/userwallet", {
          Wallet,
          History,
          user: req.session.user,
          referral,
        });
      })
      .catch((empty) => {
        res.render("user/userwallet", { empty, user: req.session.user });
      });
  },
  returnProduct: (req, res) => {
    orderhelper.return(req.params.id, req.params.product).then(() => {
      res.redirect("/order");
    });
  },
  getWishlist: (req, res) => {
    wishlistHelper.getwishlist(req.session.user._id).then((Wishlist) => {
      if (Wishlist.length == 0) {
        Wishlist.empty = true;
      }
      res.render("user/whislist", { Wishlist ,user: req.session.user,});
    });
  },

  addWishlist: (req, res) => {
    addcart = {};
    if (req.session.user) {
      wishlistHelper
        .addtowishlist(req.session.user._id, req.body.product)
        .then(() => {
          addcart.status = true;
          res.json(addcart);
        });
    } else {
      addcart.status = false;
      res.json(addcart);
    }
  },
  delWishItem: (req, res) => {
    wishlistHelper
      .deleteWishlist(req.session.user._id, req.params.id)
      .then(() => {
        res.json({ status: true });
      });
  },
  editAddres: (req, res) => {
    userHelper.updateAddres(req.session.user._id, req.body).then(() => {
      res.redirect("/userAddress");
    });
  },
  getChangepassword: (req, res) => {
    res.render("user/userPassword",{failedotp:req.session.failedotp});
    delete req.session.failedotp
  },

  changepassword:(req,res)=>{
    userHelper.changePassword(req.session.user._id,req.body).then(()=>{
      res.json({status:true})
    }).catch((message)=>{
      res.json({message})
    })
  },

  chngePassOTP: (req, res) => {
    client.verify
      .services(process.env.twilio_serviceID)
      .verifications.create({
        to: `+91${req.session.user.phone}`,
        channel: "sms",
      })
      .then((data) => {
        req.session.mobilenumber = data.to;
        res.json({status:true})
      })
      .catch((error) => {
        console.error(error);
      });
  },

  changeotpverify:(req,res)=>{
    var arr = Object.values(req.body);
    var otp = arr.toString().replaceAll(",", "");
    client.verify
      .services(process.env.twilio_serviceID)
      .verificationChecks.create({
        to: req.session.mobilenumber,
        code: otp,
      })
      .then((data) => {
        if (data.valid) {
          res.redirect('/changpasswordotp')
        }
        else{
          req.session.failedotp="Invalid OTP Please Try Again"
          res.redirect('/changePassword')
        }
      })
    .catch((error)=>{console.error(error);})
  },

  changePasswordOTP:(req,res)=>{
    res.render('user/changeSinglepass')
  },

  otpPasswordChange:(req,res)=>{
    console.log(req.body);
    userHelper.otpChangePass(req.session.user._id,req.body).then(()=>{
      req.session.failedotp="Password Changed"
      res.redirect('/changePassword')
    })
  },

  logout:(req, res) => {
    req.session.userLogIn = null;
    req.session.user = null;
    delete req.session.returnToUrl
    res.redirect("/");
  }
};
