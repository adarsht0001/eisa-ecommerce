var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("hbs");
var session = require("express-session");
const nocache = require("nocache");
colors = require("colors");

var db = require("./config/connection");
// declaring partials path
var pathpartial = path.join(__dirname, "views/partials");
// requiring routers
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
var categoryRouter = require("./routes/category");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// hbs partial setup
hbs.registerPartials(pathpartial);
// inc helper for +1 index in tables
hbs.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1;
});

// cache control middleware
app.use(nocache());

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret-key",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    resave: false,
    saveUninitialized: true,
  })
);

// connecting with database
db.connect((err) => {
  if (err) {
    console.log("connection error" + err);
  } else {
    console.log("db connected".rainbow);
  }
});

// router setup
app.use("/admin", adminRouter);
app.use("/", usersRouter);
app.use("/category", categoryRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
