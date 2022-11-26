const userHelper = require("../helper/userhelper");
const categoryhelper = require("../helper/categoryhelper");
const carthelper = require("../helper/carthelper");
const orderhelper = require("../helper/orderhelper");
const producthelper = require("../helper/producthelper");
const payPalhelper = require("../helper/payPal");
const couponhelper = require("../helper/couponhelper");
const { json } = require("express");

module.exports = {
  checkout: async(req, res) => {
    let products = await carthelper.viewcart(req.session.user._id);
    let wallettotal = await couponhelper.findWalletTotal(req.session.user._id);
    let total = await orderhelper.total(req.session.user._id);
    let recent=false;
    let Discount=false
    if (req.session.coupon) {
      Discount=req.session.coupon.Total-total.total
      total.total = req.session.coupon.Total;
      proname = req.session.coupon.product;
      proprice = req.session.coupon.price;
      for (i = 0; i < proname.length; i++) {
        products.forEach((element) => {
          if (element.products.product === proname[i]) {
            element.total = proprice[i];
          }
        });
      }
    }
    userHelper
    .getAddres(req.session.user._id)
    .then((response) => {
      if (response.length > 0) {
        address = response[0];
        if(response.length===1){
          recent=false
        }
        else{
          recent=response[response.length-1]
        }
      } else {
        address = false;
      }
      res.render("user/checkout", {
        user: req.session.user,
        address,
        recent,products,total,Discount,wallettotal
      });
    })
    
    
  },
  checkoutPOst: async (req, res) => {
    user = req.session.user._id;
    product = await orderhelper.findcart(user);
    let total = await orderhelper.total(user);
    userdata = req.body;
    if (req.session.coupon) {
      total.total = req.session.coupon.Total;
      proname = req.session.coupon.product;
      proprice = req.session.coupon.price;
      for (i = 0; i < proname.length; i++) {
        product.forEach((element) => {
          if (element.name === proname[i]) {
            element.Total = proprice[i];
          }
        });
      }
    }
    userdata.total = total.total;
    orderhelper.createOrder(userdata, product).then(async (response) => {
      req.session.orderId = response.insertedId;
      orderId = response.insertedId;
      if (req.body.Payment === "COD") {
        res.json({
          codSucess: true,
        });
      } else if (req.body.Payment === "RazorPay") {
        userHelper.generteRazorpay(orderId, total.total).then((response) => {
          response.unkonwn = true;
          response.user = {
            name: req.session.user.name,
            mobile: req.session.user.phone,
            email: req.session.user.email,
          };
          res.json(response);
        });
      } else if (req.body.Payment === "Wallet") {
        wallettotal = await couponhelper.findWalletTotal(req.session.user._id);
        if (wallettotal >= total.total) {
          couponhelper
            .walletPurchase(req.session.user._id, total.total)
            .then(() => {
              orderhelper.setStatus(orderId).then(() => {
                res.json({walletSucess:true});
              });
            });
        } else {
          res.json({ walletPaymentFail: true });
        }
      } else {
        let items=await payPalhelper.OrderItems(orderId)
        total = items.reduce(function (accumulator, items) {
          return accumulator + items.price * items.quantity;
        }, 0);
        req.session.total = total;
        payPalhelper.createorder(items, total).then((payment) => {
          for (i = 0; i < payment.links.length; i++) {
            if (payment.links[i].rel == "approval_url") {
              res.json(payment.links[i]);
            }
          }
        });
      }
    });
  },
  ordersucess: (req, res) => {
    if(req.session.orderId){
      orderhelper.removeCart(req.session.user._id);
      if (req.session.coupon) {
        orderhelper.setCoupon(req.session.user._id, req.session.coupon.coupon);
      }
      res.render("user/ordersucess");
    }else{
      res.redirect('/')
    }
  },
  viewOrder: async (req, res) => {
    orders = await orderhelper.vieworder(req.session.user._id);
    orders.forEach((element) => {
      if (element.status == "Delivered") {
        element.delivered = true;
      } else if (element.status == "Requested Return") {
        element.return = true;
      } else if (
        element.status == "Return Rejected" ||
        element.status == "Returned"||
        element.status=='Order Cancelled'
        ) {
        element.none = true;
      }
    });
    res.render("user/orderpage", {
      orders,
      user: req.session.user,
    });
  },

  cancelOrder: (req, res) => {
    orderhelper.cancelOrder(req.params.id, req.params.product).then(async () => {
      let product = await orderhelper.findProduct(
        req.params.id,
        req.params.product
      );
      if (product[0].payment !== "COD") {
        data = {
          user: req.session.user._id,
        };
        userHelper.getRefund(data, product[0].Total);
      }
      res.redirect("/order");
    });
  },
  verifyRazor:(req, res) => {
    userHelper
      .verifyOrder(req.body)
      .then(() => {
        orderhelper.setStatus(req.body["order[receipt]"]).then(() => {
          res.json({
            status: true,
          });
        });
      })
      .catch((err) => {
        res.json({
          status: false,
          errMsg: "",
        });
      });
  },

  RazorPayOnFailure:(req, res) => {
    orderhelper.deleteOrder(req.body["orderid[receipt]"]).then(() => {
      res.json({ status: true });
    });
  },

  paypalVerify:(req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    payPalhelper.verify(payerId, paymentId, req.session.total).then(() => {
      orderhelper.setStatus(req.session.orderId).then(() => {
        res.redirect("/ordersucess");
      });
    });
  },

  paypalCancel:(req, res) => {
    if (req.session.orderId) {
      orderhelper.deleteOrder(req.session.orderId).then(() => {
        res.redirect("/checkout");
        delete req.session.orderId
      });
    } else {
      res.redirect('/');
    }
  },

  applycoupon: (req, res) => {
    couponhelper
    .findcoupon(req.body.name, req.session.user._id)
    .then((response) => {
      res.json({ status: true, data: response });
    })
    .catch((message) => {
      res.json({ status: false, message });
    });
  },

  assignCoupon:(req, res) => {
    [DiscountedTotal, DiscountedPrice, DiscountedProduct, coupons] =
      Object.values(req.body);
    req.session.coupon = {
      Total: DiscountedTotal,
      product: DiscountedProduct,
      price: DiscountedPrice,
      coupon: coupons,
    };
    res.json({ status: true });
  }

};
