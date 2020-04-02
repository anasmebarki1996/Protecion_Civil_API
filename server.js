const express = require("express");
const app = express();
const morgan = require("morgan");
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
const appError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const limiter = rateLimit({
  // pour maximiser 100 requetes / heure pour le meme @IP
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP,please try again in an hour !"
});

// app.use("/API", limiter);
// set security HTTP headers
app.use(helmet());

// process.on("uncaughtException", err => {
//   console.log(err.name, err.message);
//   console.log("UNHADLED REJECTION! Shuting down ...");
//   process.exit(0);
// });

dotenv.config({
  path: "./config.env"
});
const mongoose = require("mongoose");

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("db connecction successful !");
  });

if ((process.env.NODE_ENV = "developement")) {
  app.use(morgan("dev"));
}

// Serving static file from public
app.use(express.static("public"));

//partie bodyParser
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
//fin partie bodyParser

// data sanitization agaist NoSQL query injection
app.use(mongoSanitize());

// data sanitization agaist XSS
app.use(xss());

// prevent paremeter poulution
app.use(hpp());

// ###################### Routes ######################
const agentRoutes = require("./routes/agentRoutes");
const interventionRoutes = require("./routes/interventionRoutes");
const appelRoutes = require("./routes/appelRoutes");
app.use("/API/", agentRoutes);
app.use("/API/", interventionRoutes);
app.use("/API/", appelRoutes);

app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

// ###################### FIN Routes ######################

const PORT = process.env.PORT || 30001;
const server = app.listen(PORT, process.env.LOCALHOST, function () {
  console.log("Server is running on : " + process.env.LOCALHOST + ":" + PORT);
});

process.on("unhandledRejection", err => {
  console.log(err.name, err.message);
  console.log("UNHADLED REJECTION! Shuting down ...");
  server.close(() => {
    process.exit(0);
  });
});