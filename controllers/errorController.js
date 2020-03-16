const AppErr = require("./../utils/appError");

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went worg!"
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppErr(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  console.log("hello");
  const message = `Duplicate field value : ${value}.Please use another value! `;
  return new AppErr(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data . ${errors.join(". ")}`;
  return new AppErr(message, 400);
};



const handleJWTError = err => {
  return new AppErr("Invalid token.Please log in again", 401);
};



module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV == "developement") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == "production") {
    let error = {
      ...err
    };
    if (err.name === "CastError") error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.code === "ValidationError") error = handleValidationErrorDB(error);
    if (err.code === "JsonWebTokenError" || err.code === "TokenExiredError") error = handleJWTError(error);
    sendErrorProd(error, res);
  }
};