module.exports = {
  usrauth: function (req, res, next) {
    req.session.returnToUrl = req.originalUrl;
    if (req.session.user) {
      next();
    } else {
      res.redirect("/login");
    }
  },
  loginauth: (req, res, next) => {
    if (req.session.user) {
      redirect = req.session.returnToUrl;
      delete req.session.returnToUrl;
      res.redirect(redirect);
    } else {
      next();
    }
  },
  otpAuth: (req, res, next) => {
    if (req.session.userLogIn) {
      redirect = req.session.returnToUrl;
      delete req.session.returnToUrl;
      res.redirect(redirect);
    } else {
      next();
    }
  },
  getOriginalurl: (req, res, next) => {
    req.session.returnToUrl = req.originalUrl;
    next();
  },
  adminlogin: (req, res, next) => {
    if (req.session.Adminlogged) {
      next();
    } else {
      res.redirect("/admin");
    }
  },
  adminLoginAuth: (req, res, next) => {
    if (req.session.Adminlogged) {
      redirect = req.session.returnToUrl;
      delete req.session.returnToUrl;
      res.redirect(redirect);
    } else {
      next();
    }
  },
};
