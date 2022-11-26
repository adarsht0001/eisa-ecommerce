var express = require("express");
const { response } = require("../app");
const categoryhelper = require("../helper/categoryhelper");
const { addCategory } = require("../helper/categoryhelper");
var router = express.Router();
var category = require("../helper/categoryhelper");

// enter a category to the form
router.get("/add", (req, res) => {
  res.render("admin/addcategory", {
    invalid: req.session.invalid,
  });
  req.session.invalid = false;
});

// adds category to form
router.post("/add", (req, res) => {
  category.addCategory(req.body).then((response) => {
    if (response.exists) {
      req.session.invalid = "Category Already Exists";
      res.redirect("/category/add");
    } else {
      res.redirect("/admin/category");
    }
  });
});

// delete category
router.get("/delete/:id", (req, res) => {
  var catid = req.params.id;
  categoryhelper.deletecategory(catid).then((response) => {
    res.redirect("/admin/category");
  });
});

// gets a category for with values
router.get("/edit/:id", async (req, res) => {
  let category = await categoryhelper.getDetails(req.params.id);
  res.render("admin/editcategory", {
    category,
  });
});

// edits the category
router.post("/edit/:id", (req, res) => {
  categoryhelper.updatecategory(req.params.id, req.body).then((response) => {
    res.redirect("/admin/category");
  });
});

module.exports = router;
