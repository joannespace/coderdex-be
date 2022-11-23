require("dotenv").config();
const cors = require("cors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

app.use("/images", express.static("./images"));

//No route found
app.use((req, res, next) => {
  const error = new Error("Page not found");
  error.statusCode = 404;
  next(error);
});

//Error-handling middleware
app.use((err, req, res, next) => {
  //   console.log(typeof err);
  const { statusCode, message } = err;
  res.status(statusCode);
  res.send(message);
});

module.exports = app;
