const userHelper = require("../helper/userhelper");
const categoryhelper = require("../helper/categoryhelper");
const carthelper = require("../helper/carthelper");
const orderhelper = require("../helper/orderhelper");
const producthelper = require("../helper/producthelper");

module.exports={
    getCart:async (req, res) => {
      req.session.coupon=null
        let products = await carthelper.viewcart(req.session.user._id);
        let total = await orderhelper.total(req.session.user._id);
        if (products.length == 0) {
          products.empty = true;
        }
        res.render("user/cart", {
          user: req.session.user,
          products,
          total,
        });
      },
      deleteCart:(req, res) => {
        carthelper.deleteitem(req.session.user._id, req.params.id).then(() => {
          res.redirect("/cart");
        });
      },
      changequantity:(req, res) => {
        carthelper.changequantity(req.body).then((response) => {
          res.json(response);
        });
      },
      addtoCart: (req, res) => {
        if (req.session.userLogIn) {
          carthelper.addtocart(req.params.id, req.session.user._id).then((data) => {
            res.json({
              status: true,
            });
          });
        } else {
          res.json({
            status: false,
          });
        }
      }
}