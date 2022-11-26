const adminHelper = require("../helper/adminhelper");
const categoryhelper = require("../helper/categoryhelper");
const couponhelper = require("../helper/couponhelper");
const orderhelper = require("../helper/orderhelper");
var producthelper = require("../helper/producthelper");
const userhelper = require("../helper/userhelper");

require('dotenv').config()
// admin login credentials
const admin = {
    name: process.env.admin_Name,
    password: process.env.admin_password,
  };

module.exports = {
  getLogin: function (req, res, next) {
    res.render("admin/adminlogin", {
      errorMessage: req.session.adminloginfail,
    });
    delete req.session.adminloginfail;
  },
  postLogin: (req, res) => {
    let name = req.body.name;
    let password = req.body.password;
    if (name === admin.name && password === admin.password) {
      req.session.Adminlogged = true;
      res.redirect("/admin/adminpanel");
    } else {
      req.session.adminloginfail = "Incorrect Password or Name";
      res.redirect("/admin");
    }
  },
  adminpanel:async (req, res) => {
    let length =await adminHelper.getuserCount()
    res.render("admin/adminpanel",{length});
  },
  getCategory:(req, res) => {
    categoryhelper.viewcategory().then((category) => {
      res.render("admin/admincategory", {
        category,
      });
    });
  },
  getUser:(req, res) => {
    adminHelper.viewUser().then((users) => {
      res.render("admin/viewcustomer", {
        users,
      });
    });
  },
  blockuser:(req, res) => {
    adminHelper.blockuser(req.params.id).then((response) => {
      if (response) {
        res.redirect("/admin/adminuser");
      }
    });
  },
  unblockuser:(req, res) => {
    adminHelper.unblockuser(req.params.id).then((response) => {
      if (response) {
        res.redirect("/admin/adminuser");
      }
    });
  },
  getProducts:(req, res) => {
    producthelper.getAllProducts().then((product) => {
      res.render("admin/adminproduct", {
        product,
      });
    });
  },
  getAddproduct:(req, res) => {
    categoryhelper.viewcategory().then((category) => {
      res.render("admin/addproduct", {
        category,
      });
    });
  },
  postAddproduct:(req, res, next) => {
    const filesname = req.files.map(filename);
    function filename(file) {
      return file.filename;
    }
    let productDetails = req.body;
    productDetails.imagefileName = filesname;
    producthelper.addproduct(productDetails).then((productDetails) => {
      res.redirect("/admin/products");
    });
  },
  deleteProduct:(req, res) => {
    producthelper.deleteProduct(req.params.id).then((response) => {
      res.redirect("/admin/products");
    });
  },
  editProduct:(req, res) => {
    producthelper.findProductDetails(req.params.id).then((data) => {
      categoryhelper.viewcategory().then((category) => {
        res.render("admin/editproduct", {
          data,
          category,
        });
      });
    });
  },
  editProductPost: (req, res) => {
    const filesname = req.files.map(filename);
  
    function filename(file) {
      return file.filename;
    }
    let productDetails = req.body;
    productDetails.imagefileName = filesname;
  
    let id = req.params.id;
    producthelper.updateProduct(req.params.id, productDetails).then(() => {
      res.redirect("/admin/products");
    });
  },
  order: (req, res) => {
    orderhelper.adminorderlist().then((order) => {
      res.render("admin/adminorder", {
        order,
      });
    });
  },
  viewOrderItems:async (req, res) => {
    let product = await orderhelper.adminvieworderitems(req.params.id);
    product.forEach((element) => {
      if (element.status == "Requested Return") {
        element.return = true;
      } else if (
        element.status == "Return Rejected" ||
        element.status == "Returned" ||
        element.status == "Delivered" ||
        element.status == "Order Cancelled"
      ) {
        element.none = true;
      }
    });
    res.render("admin/viewsingleorder", {
      product,
    });
  },
  pieData:async (req, res) => {
    value = await adminHelper.chartPayment();
    const name = value.map(function filename(file) {
      return file._id;
    });
  
    const data = value.map((file) => {
      return file.Total;
    });
    res.json({
      name,
      data,
    });
  },
  linegraph:async (req, res) => {
    value = await adminHelper.amount();
    const name = value.map(function filename(file) {
      return file._id;
    });
  
    const data = value.map((file) => {
      return file.Total;
    });
    res.json({
      name,
      data,
    });
  },
  yearly:async (req, res) => {
    let year = await adminHelper.getYearly();
    var orderCounts = Array(12).fill(0);
    for (let date of year) {
      orderCounts[date._id.month - 1] = date.Total;
    }
    res.json({ orderCounts });
  },
  cancelproduct:(req, res) => {
    orderhelper.cancelOrder(req.params.id, req.params.product).then(() => {
      res.redirect("/admin/vieworderitems/" + req.params.id);
    });
  },
  changeOrderStatus:(req, res) => {
    orderhelper.changeStatus(req.body).then(async () => {
      if (req.body.action === "Returned") {
        let refundMoney = await orderhelper.refundMoney(req.body);
        userhelper.getRefund(req.body, refundMoney);
      }
      res.json({ status: true });
    });
  },
  salesReport: async (req, res) => {
    let report = await adminHelper.AnnualSale();
    res.render("admin/adminSalesReport", { report });
  },

  coupon:(req, res) => {
    adminHelper.viewCoupons().then((coupons) => {
      res.render("admin/coupon", { coupons });
    });
  },
  getaddcoupoun:(req, res) => {
    res.render("admin/addCoupon");
  },
  postaddcoupon:(req, res) => {
    adminHelper.addCoupon(req.body).then(() => {
      res.redirect("/admin/coupon");
    });
  },
  deleteCoupon:(req, res) => {
    couponhelper.deleteCoupon(req.body.coupon).then(() => {
      res.json({ status: true });
    });
  },
  banner: (req, res) => {
    adminHelper.getBanners().then((banners) => {
      res.render("admin/banner", { banners });
    });
  },

  getAddbanner:(req, res) => {
    res.render("admin/addBanner");
  },
  postAddbanner:(req, res) => {
    const imgname = req.file.filename;
    let bannerDetails = req.body;
    bannerDetails.imagefileName = imgname;
    adminHelper.addBanner(bannerDetails).then(() => {
      res.redirect("/admin/banner");
    });
  },
  deleteBanner:(req, res) => {
    adminHelper.deleteBanner(req.params.id).then(() => {
      res.redirect("/admin/banner");
    });
  },
  changeBannerstatus:(req, res) => {
    adminHelper
      .changeBannerStatus(req.body)
      .then(() => res.json({ status: true }));
  },
  fromTo: (req, res) => {
    date = req.query;
    adminHelper.fromTo(date).then((Data) => {
      res.render("admin/adminSalesReport", { Data, date });
    });
  },
  monthly:(req, res) => {
    let cdate = req.query;
    let vals = cdate.month.split("-");
    dates = {
      month: vals[1],
      year: vals[0],
    };
    adminHelper.getSalesByMonth(dates).then((Data) => {
      res.render("admin/adminMonthly", { Data, cdate });
    });
  },
  yearlySales:(req, res) => {
    const month = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    let cyear = req.query;
    adminHelper.getSalesByyear(cyear).then((Data) => {
      Data.forEach((element) => {
        element._id = month[element._id - 1];
      });
      res.render("admin/adminMonthly", { Data, cyear });
    });
  },
  categoryChart:(req, res) => {
    adminHelper.categorychart().then((value) => {
      const name = value.map((file) =>{
        return file._id;
      });
    
      const data = value.map((file) => {
        return file.total;
      });
      res.json({
        name,
        data,
      });
    });
  },
  findcategory:(req,res)=>{
    categoryhelper.categoryAddpro(req.query.category).then((data)=>{
      res.json(data)
    })
  },
  logout:(req,res,next)=>{
    delete req.session.Adminlogged
    delete req.session.returnToUrl
    res.redirect('/admin')
  }
};
